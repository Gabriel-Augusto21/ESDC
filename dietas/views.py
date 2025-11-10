from django.shortcuts import render, get_object_or_404, redirect
from dietas.models import Dieta, ComposicaoDieta
from alimentos.models import ComposicaoAlimento, Nutriente, Alimento
from exigencias.models import Exigencia, ComposicaoExigencia
from decimal import Decimal
from django.core.paginator import Paginator
from django.http import JsonResponse

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

    context = {
        'dieta': dieta,
        'comp_dieta': comp_dieta,
        'todos_nutrientes': todos_nutrientes,
        'nutrientes_por_alimento': nutrientes_por_alimento,
        'total_fornecido': total_fornecido,
        'unidade_por_nutriente': unidade_por_nutriente,
        'exigencia': exigencia,
        'exigencia_por_nutriente': exigencia_por_nutriente,
        'balanceamento': balanceamento,
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
    exigencias = Exigencia.objects.all()
    alimentos = Alimento.objects.all()

    if request.method == 'GET':
        return render(request, 'inserir_dietas.html', {
            "exigencias": exigencias,
            "alimentos": alimentos,
            "itens": []
        })

    nome = request.POST.get("nome")
    desc = request.POST.get("descricao", "")
    ex_id = request.POST.get("exigencia")

    alimentos_ids = request.POST.getlist("alimentos[]")
    quantidades = request.POST.getlist("quantidades[]")

    dieta = Dieta.objects.create(
        nome=nome,
        descricao=desc,
        especifica=esp,
        exigencia_id=ex_id
    )

    for ali_id, qtd in zip(alimentos_ids, quantidades):
        ComposicaoDieta.objects.create(
            dieta=dieta,
            alimento_id=ali_id,
            quantidade=Decimal(qtd)
        )

    return redirect("dietas:dietas")


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
    from decimal import Decimal
    from alimentos.models import Alimento, ComposicaoAlimento
    from exigencias.models import Exigencia, ComposicaoExigencia

    ex_id = request.POST.get("exigencia")
    alimentos_ids = request.POST.getlist("alimentos[]")
    quantidades = request.POST.getlist("quantidades[]")

    if not ex_id or not alimentos_ids:
        return JsonResponse({"erro": "Dados incompletos"}, status=400)

    exigencia = Exigencia.objects.get(id=ex_id)
    exig = {
        e.nutriente.nome: float(e.valor)
        for e in ComposicaoExigencia.objects.filter(exigencia=exigencia)
    }

    totais = {}
    for ali_id, qtd in zip(alimentos_ids, quantidades):
        ali = Alimento.objects.get(id=ali_id)
        for comp in ali.composicaoalimento_set.all():
            nome = comp.nutriente.nome
            totais[nome] = totais.get(nome, 0) + float(comp.valor) * float(qtd)

    balanceamento = {
        n: round(totais.get(n, 0) - exig.get(n, 0), 2)
        for n in set(list(totais.keys()) + list(exig.keys()))
    }

    return JsonResponse({
        "totais": {k: round(v, 2) for k, v in totais.items()},
        "exigencia": exig,
        "balanceamento": balanceamento,
    })