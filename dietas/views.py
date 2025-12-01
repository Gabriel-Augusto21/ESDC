from django.shortcuts import render, get_object_or_404, redirect
from dietas.models import Dieta, ComposicaoDieta
from alimentos.models import ComposicaoAlimento, Nutriente, Alimento
from exigencias.models import Exigencia, ComposicaoExigencia
from animais.models import Animal
from decimal import Decimal
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.utils import timezone

def gerenciar_dietas(request, id):
    dieta = get_object_or_404(Dieta, pk=id)
    comp_dieta = (
        ComposicaoDieta.objects.filter(dieta=dieta)
        .select_related('alimento', 'alimento__classificacao')
        .prefetch_related('alimento__composicaoalimento_set__nutriente')
    )

    # --- Exigência vinculada ---
    exigencia = dieta.exigencia
    composicoes_exigencia = ComposicaoExigencia.objects.filter(exigencia=exigencia).select_related('nutriente')

    # Criar um dicionário com os valores exigidos por nutriente
    exigencia_por_nutriente = {
        ce.nutriente.nome: round(ce.valor, 2) for ce in composicoes_exigencia
    }

    # --- Totais fornecidos pela dieta ---
    totais = dieta.total_nutrientes_vetor()
    total_fornecido = {t['nutriente']: round(t['total'], 2) for t in totais}
    unidade_por_nutriente = {t['nutriente']: t['unidade'] for t in totais}

    # --- Nutrientes usados na tabela ---
    todos_nutrientes = set()
    for comp in comp_dieta:
        for ca in comp.alimento.composicaoalimento_set.all():
            todos_nutrientes.add(ca.nutriente)
    todos_nutrientes = sorted(list(todos_nutrientes), key=lambda n: n.nome)

    # --- Nutrientes por alimento ---
    nutrientes_por_alimento = {}
    for comp in comp_dieta:
        nutrientes_por_alimento[comp.alimento.id] = {n.id: 0 for n in todos_nutrientes}
        for ca in comp.alimento.composicaoalimento_set.all():
            nutrientes_por_alimento[comp.alimento.id][ca.nutriente.id] = round(ca.valor, 2)

    # --- Balanceamento: diferença entre fornecido e exigido ---
    balanceamento = {}
    for nutriente_nome in total_fornecido.keys():
        valor_fornecido = total_fornecido.get(nutriente_nome, 0)
        valor_exigido = exigencia_por_nutriente.get(nutriente_nome, 0)
        balanceamento[nutriente_nome] = round(valor_fornecido - valor_exigido, 2)
    exigencias = Exigencia.objects.exclude(id=exigencia.id)

    animal = dieta.animal
    
    resumo_balanceamento = []
    for nutriente in sorted(todos_nutrientes, key=lambda n: n.nome):
        nome = nutriente.nome
        fornecido = total_fornecido.get(nome, 0)
        exigido = exigencia_por_nutriente.get(nome, 0)
        diferenca = balanceamento.get(nome, 0)
        resumo_balanceamento.append({
            'nutriente': nome,
            'fornecido': fornecido,
            'exigido': exigido,
            'diferenca': diferenca
        })
    
    
    context = {
        'dieta': dieta,
        'comp_dieta': comp_dieta,
        'todos_nutrientes': todos_nutrientes,
        'nutrientes_por_alimento': nutrientes_por_alimento,
        'total_fornecido': total_fornecido,
        'unidade_por_nutriente': unidade_por_nutriente,
        'exigencia': exigencia,
        'exigencias': exigencias,
        'exigencia_por_nutriente': exigencia_por_nutriente,
        'animal': animal,
        'balanceamento': balanceamento,
        'resumo_balanceamento': resumo_balanceamento,
    }
    return render(request, 'gerenciar_dietas.html', context)

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

    alimentos = Alimento.objects.all()
    itens = request.session.get("dieta_temp", [])

    return render(request, "inserir_dietas_dois.html", {
        "dados": dados,
        "animal": animal,
        "exigencia": exigencia,
        "exigencia_id": exigencia.id,
        "alimentos": alimentos,
        "itens": itens,
    })

def desativar_dieta(request):
    id = request.GET.get('id')
    dieta = Dieta.objects.get(id=id)
    dieta.is_active = False
    dieta.save()
    print(dieta.data_criacao)
    print(dieta.animal.nome)
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

def add_item_dieta_temp(request):
    alim_id = request.POST.get("alimento")
    qtd = Decimal(request.POST.get("quantidade"))

    dieta_temp = request.session.get("dieta_temp", [])

    existente = next((i for i in dieta_temp if i["id"] == int(alim_id)), None)

    ali = Alimento.objects.get(id=alim_id)

    if existente:
        existente["quantidade"] += float(qtd)
    else:
        dieta_temp.append({
            "id": ali.id,
            "nome": ali.nome,
            "quantidade": float(qtd)
        })

    request.session["dieta_temp"] = dieta_temp

    return JsonResponse({"ok": True, "itens": dieta_temp})


def remover_item_dieta_temp(request):
    alim_id = request.POST.get("id")

    dieta_temp = request.session.get("dieta_temp", [])
    dieta_temp = [i for i in dieta_temp if str(i["id"]) != str(alim_id)]
    request.session['dieta_temp'] = dieta_temp

    return JsonResponse({"ok": True, "itens": dieta_temp})

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
