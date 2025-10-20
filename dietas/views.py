from django.shortcuts import render
from .models import Dieta, ComposicaoDieta
from decimal import Decimal

def dietas(request):
    lista_dieta = Dieta.objects.get(pk=1)
    comp_dieta = ComposicaoDieta.objects.filter(dieta=lista_dieta)

    # Totais agregados 
    totais = lista_dieta.total_nutrientes_vetor()
    lista_totais_fornecidos = []
    for t in totais:
        lista_totais_fornecidos.append(f"{t['nutriente']} - {round(t['total'], 2)} {t['unidade']}")

    # Nutrientes por alimento
    alimentos_nutrientes = []
    for comp in comp_dieta:
        nutriente_alimento = []
        for ca in comp.alimento.composicaoalimento_set.all():
            quantidade_nutriente_dieta = round(Decimal(ca.valor) * Decimal(comp.quantidade), 2)
            nutriente_alimento.append({
                'nutriente': ca.nutriente.nome,
                'valor': round(Decimal(ca.valor), 2),
                'produto': quantidade_nutriente_dieta,
                'unidade': ca.nutriente.unidade
            })
        alimentos_nutrientes.append({
            'alimento': comp.alimento.nome,
            'quantidade': round(comp.quantidade, 2),
            'nutrientes': nutriente_alimento
        })

    return render(request, 'dietas.html', {
        'dietas': lista_dieta,
        'compdieta': comp_dieta,
        'lista_totais': lista_totais_fornecidos,
        'alimentos_nutrientes': alimentos_nutrientes
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
