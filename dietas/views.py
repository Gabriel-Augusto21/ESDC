from django.shortcuts import render, get_object_or_404, redirect
from dietas.models import Dieta, ComposicaoDieta
from alimentos.models import ComposicaoAlimento, Nutriente, Alimento
from exigencias.models import Exigencia, ComposicaoExigencia
from animais.models import Animal
from decimal import Decimal
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.utils import timezone


# ===== FUNÇÕES AUXILIARES =====

def calcular_totais_e_balanceamento(dieta_temp, header_nutrientes, exigencia_id):
    """Função auxiliar para calcular totais, exigência e balanceamento"""
    
    # ===== CALCULA TOTAL FORNECIDO =====
    total_ms = 0
    total_pb = 0
    total_ed = 0
    totais_nutrientes = {n: 0 for n in header_nutrientes}

    for item in dieta_temp:
        qtd_item = item["quantidade"]
        total_ms += item.get("ms", 0) * qtd_item
        total_pb += item.get("pb", 0) * qtd_item
        total_ed += item.get("ed", 0) * qtd_item
        
        for i, nutriente_nome in enumerate(header_nutrientes):
            if i < len(item.get("comp_alimento", [])):
                valor = item["comp_alimento"][i]
                if valor != "-" and valor != 0:
                    totais_nutrientes[nutriente_nome] += float(valor) * qtd_item

    total_fornecido = {
        "ms": round(total_ms, 4),
        "pb": round(total_pb, 4),
        "ed": round(total_ed, 4),
        "nutrientes": {k: round(v, 4) for k, v in totais_nutrientes.items()}
    }

    # ===== BUSCA EXIGÊNCIA =====
    exigencia_valores = {"ms": 0, "pb": 0, "ed": 0, "nutrientes": {}}
    exigencia_nome = ""
    exigencia_peso = ""
    
    if exigencia_id:
        try:
            exigencia = Exigencia.objects.get(id=exigencia_id)
            exigencia_nome = exigencia.nome
            exigencia_peso = str(exigencia.categoria.peso_vivo) if hasattr(exigencia, 'categoria') and exigencia.categoria else ""
            
            comp_exigencia = ComposicaoExigencia.objects.filter(
                exigencia=exigencia
            ).select_related("nutriente")
            
            for ce in comp_exigencia:
                nutriente_nome = ce.nutriente.nome
                if nutriente_nome == "MS":
                    exigencia_valores["ms"] = float(ce.valor)
                elif nutriente_nome == "PB":
                    exigencia_valores["pb"] = float(ce.valor)
                elif nutriente_nome == "ED":
                    exigencia_valores["ed"] = float(ce.valor)
                else:
                    exigencia_valores["nutrientes"][nutriente_nome] = float(ce.valor)
        except Exigencia.DoesNotExist:
            pass

    # ===== CALCULA BALANCEAMENTO =====
    balanceamento = {
        "ms": round(total_fornecido["ms"] - exigencia_valores["ms"], 4),
        "pb": round(total_fornecido["pb"] - exigencia_valores["pb"], 4),
        "ed": round(total_fornecido["ed"] - exigencia_valores["ed"], 4),
        "nutrientes": {}
    }
    
    for nutriente_nome in header_nutrientes:
        fornecido = total_fornecido["nutrientes"].get(nutriente_nome, 0)
        exigido = exigencia_valores["nutrientes"].get(nutriente_nome, 0)
        balanceamento["nutrientes"][nutriente_nome] = round(fornecido - exigido, 4)

    return {
        "total_fornecido": total_fornecido,
        "exigencia": {
            "nome": exigencia_nome,
            "peso": exigencia_peso,
            "valores": exigencia_valores
        },
        "balanceamento": balanceamento
    }


def recalcular_header_e_matriz(dieta_temp):
    """Recalcula o header de nutrientes e a matriz de cada alimento"""
    if not dieta_temp:
        return [], dieta_temp
    
    # Encontra o alimento com mais nutrientes
    maior_alimento = max(
        dieta_temp,
        key=lambda x: len([ca for ca in x.get("comp_alimento_detalhado", []) if ca["valor"] != 0]),
        default=None
    )
    
    header_nutrientes = []
    if maior_alimento and "comp_alimento_detalhado" in maior_alimento:
        header_nutrientes = [ca["nutriente"] for ca in maior_alimento["comp_alimento_detalhado"]]
    
    # Recalcula a matriz de cada alimento
    for a in dieta_temp:
        if "comp_alimento_detalhado" in a:
            comp_dict = {ca["nutriente"]: ca["valor"] for ca in a["comp_alimento_detalhado"]}
            a["comp_alimento"] = [comp_dict.get(n, 0) for n in header_nutrientes]
            a["nutrientes_header"] = header_nutrientes
    
    return header_nutrientes, dieta_temp


# ===== VIEWS PRINCIPAIS =====
def gerenciar_dietas(request, id):
    dieta = get_object_or_404(Dieta, pk=id)
    comp_dieta = (
        ComposicaoDieta.objects.filter(dieta=dieta)
        .select_related('alimento', 'alimento__classificacao')
        .prefetch_related('alimento__composicaoalimento_set__nutriente')
    )

    # ===== POPULA A SESSÃO COM OS ALIMENTOS DA DIETA =====
    dieta_temp = []
    for comp in comp_dieta:
        ali = comp.alimento
        
        # Busca composição detalhada do alimento
        comp_alimento_qs = ComposicaoAlimento.objects.filter(
            alimento=ali,
            is_active=True
        ).select_related("nutriente")
        
        comp_detalhado = [
            {"nutriente": ca.nutriente.nome, "valor": float(ca.valor)}
            for ca in comp_alimento_qs
        ]
        
        dieta_temp.append({
            "id": ali.id,
            "nome": ali.nome,
            "quantidade": float(comp.quantidade) if comp.quantidade else 0.0,
            "ms": float(ali.ms) if ali.ms else 0,
            "pb": float(ali.pb) if ali.pb else 0,
            "ed": float(ali.ed) if ali.ed else 0,
            "comp_alimento_detalhado": comp_detalhado
        })
    
    # ===== RECALCULA HEADER BASEADO NO ALIMENTO COM MAIS NUTRIENTES =====
    header_nutrientes = []
    if dieta_temp:
        # Encontra o alimento com mais nutrientes
        maior_alimento = max(
            dieta_temp,
            key=lambda x: len([ca for ca in x.get("comp_alimento_detalhado", []) if ca["valor"] != 0]),
            default=None
        )
        
        if maior_alimento and "comp_alimento_detalhado" in maior_alimento:
            header_nutrientes = [ca["nutriente"] for ca in maior_alimento["comp_alimento_detalhado"]]
        
        # Recalcula a matriz de cada alimento baseado no header
        for a in dieta_temp:
            if "comp_alimento_detalhado" in a:
                comp_dict = {ca["nutriente"]: ca["valor"] for ca in a["comp_alimento_detalhado"]}
                a["comp_alimento"] = [comp_dict.get(n, 0) for n in header_nutrientes]
    
    # Ordena e salva na sessão
    dieta_temp = sorted(dieta_temp, key=lambda x: x["nome"])
    request.session["dieta_temp"] = dieta_temp
    request.session["dieta_gerenciada_id"] = id

    # ===== CALCULA TOTAL FORNECIDO =====
    total_ms = 0
    total_pb = 0
    total_ed = 0
    totais_nutrientes = {n: 0 for n in header_nutrientes}

    for item in dieta_temp:
        qtd = item["quantidade"]
        total_ms += item.get("ms", 0) * qtd
        total_pb += item.get("pb", 0) * qtd
        total_ed += item.get("ed", 0) * qtd
        
        for i, nutriente_nome in enumerate(header_nutrientes):
            if i < len(item.get("comp_alimento", [])):
                valor = item["comp_alimento"][i]
                if valor and valor != 0:
                    totais_nutrientes[nutriente_nome] += float(valor) * qtd

    total_fornecido = {
        "ms": round(total_ms, 4),
        "pb": round(total_pb, 4),
        "ed": round(total_ed, 4),
        "nutrientes": {k: round(v, 4) for k, v in totais_nutrientes.items()}
    }

    # ===== BUSCA VALORES DA EXIGÊNCIA =====
    exigencia = dieta.exigencia
    exigencia_valores = {"ms": 0, "pb": 0, "ed": 0, "nutrientes": {n: 0 for n in header_nutrientes}}
    
    comp_exigencia = ComposicaoExigencia.objects.filter(
        exigencia=exigencia
    ).select_related("nutriente")
    
    for ce in comp_exigencia:
        nutriente_nome = ce.nutriente.nome
        if nutriente_nome == "MS":
            exigencia_valores["ms"] = float(ce.valor)
        elif nutriente_nome == "PB":
            exigencia_valores["pb"] = float(ce.valor)
        elif nutriente_nome == "ED":
            exigencia_valores["ed"] = float(ce.valor)
        elif nutriente_nome in header_nutrientes:
            exigencia_valores["nutrientes"][nutriente_nome] = float(ce.valor)

    # ===== CALCULA BALANCEAMENTO =====
    balanceamento = {
        "ms": round(total_fornecido["ms"] - exigencia_valores["ms"], 4),
        "pb": round(total_fornecido["pb"] - exigencia_valores["pb"], 4),
        "ed": round(total_fornecido["ed"] - exigencia_valores["ed"], 4),
        "nutrientes": {}
    }
    
    for nutriente_nome in header_nutrientes:
        fornecido = total_fornecido["nutrientes"].get(nutriente_nome, 0)
        exigido = exigencia_valores["nutrientes"].get(nutriente_nome, 0)
        balanceamento["nutrientes"][nutriente_nome] = round(fornecido - exigido, 4)

    # ===== CONTEXTO =====
    exigencias = Exigencia.objects.exclude(id=exigencia.id)
    animal = dieta.animal
    alimentos = Alimento.objects.all()

    context = {
        'dieta': dieta,
        'exigencia': exigencia,
        'exigencia_id': exigencia.id,
        'exigencias': exigencias,
        'animal': animal,
        'alimentos': alimentos,
        'header_nutrientes': header_nutrientes,
        'dieta_temp': dieta_temp,
        'total_fornecido': total_fornecido,
        'exigencia_valores': exigencia_valores,
        'balanceamento': balanceamento,
    }
    return render(request, 'gerenciar_dietas.html', context)
def salvar_balanceamento_dieta(request):
    """Salva as alterações da dieta_temp no banco de dados"""
    if request.method != "POST":
        return JsonResponse({"erro": "Método não permitido"}, status=405)
    
    dieta_id = request.session.get("dieta_gerenciada_id")
    dieta_temp = request.session.get("dieta_temp", [])
    
    if not dieta_id:
        return JsonResponse({"erro": "Nenhuma dieta sendo gerenciada"}, status=400)
    
    try:
        dieta = Dieta.objects.get(id=dieta_id)
        
        # Remove todas as composições antigas
        ComposicaoDieta.objects.filter(dieta=dieta).delete()
        
        # Cria as novas composições
        for item in dieta_temp:
            ali = Alimento.objects.get(id=item["id"])
            ComposicaoDieta.objects.create(
                dieta=dieta,
                alimento=ali,
                quantidade=Decimal(str(item["quantidade"]))
            )
        
        return JsonResponse({
            "ok": True,
            "mensagem": "Balanceamento salvo com sucesso!"
        })
    
    except Dieta.DoesNotExist:
        return JsonResponse({"erro": "Dieta não encontrada"}, status=404)
    except Exception as e:
        return JsonResponse({"erro": str(e)}, status=500)

def dietas(request):
    query = request.GET.get('query', '')
    nutrientes_lista = Dieta.objects.filter(nome__icontains=query).order_by('-is_active', 'nome')
    paginator = Paginator(nutrientes_lista, 10)
    page_obj = paginator.get_page(request.GET.get('page'))

    return render(request, 'dietas.html', {
        'dietas': page_obj,
        'page_obj': page_obj,
        'query': query
    })


def inserir_dietas_dois(request):
    dados = request.session.get("nova_dieta")

    if not dados:
        return redirect("dietas:inserir_dieta")

    animal = Animal.objects.get(id=dados["animal_id"])
    exigencia = Exigencia.objects.get(id=dados["exigencia_id"])
    todos_nutrientes = Nutriente.objects.all()
    alimentos = Alimento.objects.all()
    itens = request.session.get("dieta_temp", [])

    return render(request, "inserir_dietas_dois.html", {
        "dados": dados,
        "animal": animal,
        "exigencia": exigencia,
        "exigencia_id": exigencia.id,
        "alimentos": alimentos,
        "todos_nutrientes": todos_nutrientes,
        "itens": itens,
    })


def desativar_dieta(request):
    id = request.GET.get('id')
    dieta = Dieta.objects.get(id=id)
    dieta.is_active = False
    dieta.save()
    return JsonResponse({'Mensagem': f'{dieta.nome} foi desativado'}, status=200)


def ativar_dieta(request):
    id = request.GET.get('id')
    dieta = Dieta.objects.get(id=id)
    dieta.is_active = True
    dieta.save()
    return JsonResponse({'Mensagem': f'{dieta.nome} foi ativado'}, status=200)


def inserir_dieta(request):
    animal_id_url = request.GET.get("animal_id")

    if request.method == "POST":
        nome = request.POST.get("nome")
        descricao = request.POST.get("descricao")
        exigencia = request.POST.get("exigencia")
        animal = request.POST.get("animal")

        request.session["nova_dieta"] = {
            "nome": nome,
            "descricao": descricao,
            "exigencia_id": exigencia,
            "animal_id": animal,
        }

        request.session["dieta_temp"] = []
        return redirect("dietas:inserir_dietas_dois")

    animais = Animal.objects.all()
    exigencias = Exigencia.objects.all()

    return render(request, "inserir_dietas.html", {
        "animais": animais,
        "exigencias": exigencias,
        "animal_id_url": int(animal_id_url) if animal_id_url else None
    })


def get_nutrientes_alimento(request):
    """Retorna os nutrientes de um alimento específico"""
    alim_id = request.GET.get("alimento_id")
    
    if not alim_id:
        return JsonResponse({"erro": "ID do alimento não informado"}, status=400)
    
    try:
        ali = Alimento.objects.get(id=alim_id)
        
        comp_alimento_qs = ComposicaoAlimento.objects.filter(
            alimento=ali,
            is_active=True
        ).select_related("nutriente")
        
        nutrientes = [
            {"nutriente": ca.nutriente.nome, "valor": float(ca.valor)}
            for ca in comp_alimento_qs
        ]
        
        return JsonResponse({
            "ok": True,
            "alimento": {
                "id": ali.id,
                "nome": ali.nome,
                "ms": float(ali.ms),
                "pb": float(ali.pb),
                "ed": float(ali.ed),
                "nutrientes": nutrientes
            }
        })
    except Alimento.DoesNotExist:
        return JsonResponse({"erro": "Alimento não encontrado"}, status=404)


def add_item_dieta_temp(request):
    alim_id = request.POST.get("alimento")
    qtd = Decimal(request.POST.get("quantidade"))
    exigencia_id = request.POST.get("exigencia_id")

    dieta_temp = request.session.get("dieta_temp", [])
    existente = next((i for i in dieta_temp if i["id"] == int(alim_id)), None)

    ali = Alimento.objects.get(id=alim_id)

    comp_alimento_qs = ComposicaoAlimento.objects.filter(
        alimento=ali,
        is_active=True
    ).select_related("nutriente")

    comp_detalhado = [
        {"nutriente": ca.nutriente.nome, "valor": float(ca.valor)}
        for ca in comp_alimento_qs
    ]

    if existente:
        existente["quantidade"] += float(qtd)
        existente["comp_alimento_detalhado"] = comp_detalhado
    else:
        dieta_temp.append({
            "id": ali.id,
            "nome": ali.nome,
            "quantidade": float(qtd),
            "ms": float(ali.ms),
            "pb": float(ali.pb),
            "ed": float(ali.ed),
            "comp_alimento_detalhado": comp_detalhado
        })

    # Recalcula header e matriz
    header_nutrientes, dieta_temp = recalcular_header_e_matriz(dieta_temp)
    
    # Ordena
    dieta_temp = sorted(dieta_temp, key=lambda x: x["nome"])
    request.session["dieta_temp"] = dieta_temp

    # Calcula totais e balanceamento
    calculos = calcular_totais_e_balanceamento(dieta_temp, header_nutrientes, exigencia_id)

    return JsonResponse({
        "ok": True,
        "dietas_temp": dieta_temp,
        "header_nutrientes": header_nutrientes,
        **calculos
    })


def remover_item_dieta_temp(request):
    alim_id = request.POST.get("id")
    exigencia_id = request.POST.get("exigencia_id")

    dieta_temp = request.session.get("dieta_temp", [])
    dieta_temp = [i for i in dieta_temp if str(i["id"]) != str(alim_id)]
    
    # Recalcula header e matriz
    header_nutrientes, dieta_temp = recalcular_header_e_matriz(dieta_temp)
    
    # Ordena
    dieta_temp = sorted(dieta_temp, key=lambda x: x["nome"]) if dieta_temp else []
    request.session["dieta_temp"] = dieta_temp

    # Calcula totais e balanceamento
    calculos = calcular_totais_e_balanceamento(dieta_temp, header_nutrientes, exigencia_id)

    return JsonResponse({
        "ok": True,
        "dietas_temp": dieta_temp,
        "header_nutrientes": header_nutrientes,
        **calculos
    })


def atualizar_quantidade_dieta_temp(request):
    alim_id = request.POST.get("id")
    nova_qtd = request.POST.get("quantidade")
    exigencia_id = request.POST.get("exigencia_id")

    if not alim_id or not nova_qtd:
        return JsonResponse({"erro": "Dados incompletos"}, status=400)

    try:
        nova_qtd = float(nova_qtd)
        if nova_qtd <= 0:
            return JsonResponse({"erro": "Quantidade deve ser maior que zero"}, status=400)
    except ValueError:
        return JsonResponse({"erro": "Quantidade inválida"}, status=400)

    dieta_temp = request.session.get("dieta_temp", [])
    
    # Encontra e atualiza o item
    item_encontrado = False
    for item in dieta_temp:
        if str(item["id"]) == str(alim_id):
            item["quantidade"] = nova_qtd
            item_encontrado = True
            break
    
    if not item_encontrado:
        return JsonResponse({"erro": "Alimento não encontrado"}, status=404)

    # Recalcula header e matriz
    header_nutrientes, dieta_temp = recalcular_header_e_matriz(dieta_temp)
    
    # Ordena
    dieta_temp = sorted(dieta_temp, key=lambda x: x["nome"])
    request.session["dieta_temp"] = dieta_temp

    # Calcula totais e balanceamento
    calculos = calcular_totais_e_balanceamento(dieta_temp, header_nutrientes, exigencia_id)

    return JsonResponse({
        "ok": True,
        "dietas_temp": dieta_temp,
        "header_nutrientes": header_nutrientes,
        **calculos
    })


def calcular_balanceamento_dinamico(request):
    ex_id = request.POST.get("exigencia")
    alimentos_ids = request.POST.getlist("alimentos[]")
    quantidades = request.POST.getlist("quantidades[]")

    if not ex_id or not alimentos_ids:
        return JsonResponse({"erro": "Dados incompletos"}, status=400)

    exig = {
        e.nutriente.nome: float(e.valor)
        for e in ComposicaoExigencia.objects.filter(exigencia_id=ex_id)
    }

    totais = {}
    contribuicao = {}

    for ali_id, qtd in zip(alimentos_ids, quantidades):
        ali = Alimento.objects.get(id=ali_id)
        qtd = float(qtd)

        contribuicao[ali.nome] = {
            "quantidade": qtd,
            "ms": 0,
            "pb": 0,
            "ed": 0
        }

        for comp in ali.composicaoalimento_set.all():
            nutriente = comp.nutriente.nome
            valor = float(comp.valor) * qtd

            totais[nutriente] = totais.get(nutriente, 0) + valor

            contribuicao[ali.nome][nutriente] = round(valor, 2)

            if nutriente == "MS":
                contribuicao[ali.nome]["ms"] = round(valor, 2)
            elif nutriente == "PB":
                contribuicao[ali.nome]["pb"] = round(valor, 2)
            elif nutriente == "ED":
                contribuicao[ali.nome]["ed"] = round(valor, 2)

    balanceamento = {
        n: round(totais.get(n, 0) - exig.get(n, 0), 2)
        for n in set(list(totais.keys()) + list(exig.keys()))
    }

    return JsonResponse({
        "exigencia": exig,
        "totais": {k: round(v, 2) for k, v in totais.items()},
        "contribuicao": contribuicao,
        "balanceamento": balanceamento,
    })


def inserir_dietas_tres(request):
    """Passo 3: Conclusão e salvamento da dieta"""
    dados = request.session.get("nova_dieta")
    itens = request.session.get("dieta_temp", [])

    if not dados or not itens:
        return redirect("dietas:inserir_dieta")

    animal = Animal.objects.get(id=dados["animal_id"])
    exigencia = Exigencia.objects.get(id=dados["exigencia_id"])

    totais = {}
    for item in itens:
        ali = Alimento.objects.get(id=item["id"])
        qtd = float(item["quantidade"])
        
        for comp in ali.composicaoalimento_set.all():
            nutriente = comp.nutriente.nome
            valor = float(comp.valor) * qtd
            totais[nutriente] = totais.get(nutriente, 0) + valor

    exig = {
        e.nutriente.nome: float(e.valor)
        for e in ComposicaoExigencia.objects.filter(exigencia_id=exigencia.id)
    }

    resumo_balanceamento = []
    todos_nutrientes = set(list(totais.keys()) + list(exig.keys()))
    
    for nutriente in sorted(todos_nutrientes):
        fornecido = round(totais.get(nutriente, 0), 2)
        exigido = round(exig.get(nutriente, 0), 2)
        diferenca = round(fornecido - exigido, 2)
        
        resumo_balanceamento.append({
            'nutriente': nutriente,
            'fornecido': fornecido,
            'exigido': exigido,
            'diferenca': diferenca
        })

    if request.method == "POST":
        dieta = Dieta.objects.create(
            nome=dados["nome"],
            descricao=dados.get("descricao", ""),
            animal=animal,
            exigencia=exigencia,
            data_criacao=timezone.now()
        )

        for item in itens:
            ali = Alimento.objects.get(id=item["id"])
            ComposicaoDieta.objects.create(
                dieta=dieta,
                alimento=ali,
                quantidade=Decimal(str(item["quantidade"]))
            )

        del request.session["nova_dieta"]
        del request.session["dieta_temp"]

        return redirect("dietas:gerenciar_dietas", id=dieta.id)

    return render(request, "inserir_dietas_tres.html", {
        "dados": dados,
        "animal": animal,
        "exigencia": exigencia,
        "itens": itens,
        "resumo_balanceamento": resumo_balanceamento,
    })


def verificar_dieta_atual(request, animal_id):
    dieta = Dieta.objects.filter(animal_id=animal_id, is_active=True).last()

    return JsonResponse({
        'dieta_atual': dieta is not None,
        'id_dieta': dieta.id if dieta else None
    })