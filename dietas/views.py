from django.shortcuts import render
from .models import Dieta, ComposicaoDieta
from alimentos.models import ComposicaoAlimento

from decimal import Decimal
from django.core.paginator import Paginator


def gerenciar_dietas(request, id):
    # lista_dieta = Dieta.objects.get(pk=id)
    # comp_dieta = ComposicaoDieta.objects.filter(dieta=lista_dieta)

    # # Totais agregados 
    # totais = lista_dieta.total_nutrientes_vetor()
    # lista_totais_fornecidos = [
    #     f"{t['nutriente']} - {round(t['total'], 2)} {t['unidade']}" for t in totais
    # ]

    # alimentos_nutrientes = []
    # todos_nutrientes = set()

    # # 🔹 Coleta todos os nutrientes usados na dieta
    # for comp in comp_dieta:
    #     for ca in comp.alimento.composicaoalimento_set.all():
    #         todos_nutrientes.add(ca.nutriente.nome)

    # # 🔹 Converte pra lista e aplica substituição de espaços
    # todos_nutrientes = sorted([n.replace(' ', '_') for n in todos_nutrientes])

    # # 🔹 Monta a tabela com os valores de nutrientes
    # for comp in comp_dieta:
    #     dados_nutrientes = {n: {'produto': 0, 'unidade': ''} for n in todos_nutrientes}

    #     for ca in comp.alimento.composicaoalimento_set.all():
    #         nome_normalizado = ca.nutriente.nome.replace(' ', '_')
    #         quantidade_nutriente_dieta = round(Decimal(ca.valor) * Decimal(comp.quantidade), 2)

    #         dados_nutrientes[nome_normalizado] = {
    #             'produto': quantidade_nutriente_dieta,
    #             'unidade': ca.nutriente.unidade
    #         }

    #     alimentos_nutrientes.append({
    #         'alimento': comp.alimento.nome,
    #         'quantidade': round(comp.quantidade, 2),
    #         'nutrientes': dados_nutrientes
    #     })

    # return render(request, 'gerenciar_dietas.html', {
    #     'dietas': lista_dieta,
    #     'compdieta': comp_dieta,
    #     'lista_totais': lista_totais_fornecidos,
    #     'alimentos_nutrientes': alimentos_nutrientes,
    #     'todos_nutrientes': todos_nutrientes,
    # })
    dieta = Dieta.objects.get(pk=id)
    comp_dieta = ComposicaoDieta.objects.filter(dieta=dieta).select_related('alimento', 'alimento__classificacao').prefetch_related('alimento__composicaoalimento_set__nutriente')

    # Coletar todos os nutrientes extras de todos os alimentos da dieta
    todos_nutrientes = set()
    for comp in comp_dieta:
        for ca in comp.alimento.composicaoalimento_set.all():
            todos_nutrientes.add(ca.nutriente)
    todos_nutrientes = sorted(list(todos_nutrientes), key=lambda n: n.nome)

    # Montar um dicionário de valores de nutrientes por alimento
    nutrientes_por_alimento = {}
    for comp in comp_dieta:
        nutrientes_por_alimento[comp.alimento.id] = {n.id: 0 for n in todos_nutrientes}  # 0 por padrão
        for ca in comp.alimento.composicaoalimento_set.all():
            nutrientes_por_alimento[comp.alimento.id][ca.nutriente.id] = ca.valor

    return render(request, 'gerenciar_dietas.html', {
        'dieta': dieta,
        'comp_dieta': comp_dieta,
        'todos_nutrientes': todos_nutrientes,
        'nutrientes_por_alimento': nutrientes_por_alimento,
    })
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


# def dietas(request):
#     todas_dietas = Dieta.objects.all()
#     dietas_com_info = []

#     for dieta in todas_dietas:
#         # Composição da dieta
#         comp_dieta = dieta.composicaodieta_set.all()

#         # Totais agregados
#         totais = dieta.total_nutrientes_vetor()
#         lista_totais_fornecidos = []
#         for t in totais:
#             lista_totais_fornecidos.append({
#                 'nutriente': t['nutriente'],
#                 'total': round(t['total'], 2),
#                 'unidade': t['unidade']
#             })

#         # Nutrientes por alimento
#         alimentos_nutrientes = []
#         for comp in comp_dieta:
#             nutriente_alimento = []
#             for ca in comp.alimento.composicaoalimento_set.all():
#                 quantidade_nutriente_dieta = round(Decimal(ca.valor) * Decimal(comp.quantidade), 2)
#                 nutriente_alimento.append({
#                     'nutriente': ca.nutriente.nome,
#                     'valor': round(Decimal(ca.valor), 2),
#                     'produto': quantidade_nutriente_dieta,
#                     'unidade': ca.nutriente.unidade
#                 })
#             alimentos_nutrientes.append({
#                 'alimento': comp.alimento.nome,
#                 'quantidade': round(comp.quantidade, 2),
#                 'nutrientes': nutriente_alimento
#             })

#         dietas_com_info.append({
#             'dieta': dieta,
#             'comp_dieta': comp_dieta,
#             'totais': lista_totais_fornecidos,
#             'alimentos_nutrientes': alimentos_nutrientes
#         })

#     return render(request, 'dietas.html', {'dietas_com_info': dietas_com_info})
