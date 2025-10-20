from django.shortcuts import render
from .models import Dieta, ComposicaoDieta
from decimal import Decimal

# def dietas(request):
#     lista_dieta = Dieta.objects.get(pk=1)
#     comp_dieta = ComposicaoDieta.objects.all()
#     totais = lista_dieta.total_nutrientes_vetor()
#     print('\n')
#     lista_totais_fornecidos = []
#     for t in totais:
#         print(f"Nutriente: {t['nutriente']}, Total: {t['total']} {t['unidade']}")
#         lista_totais_fornecidos.append(f"{t['nutriente']} - {round(t['total'], 2)} {t['unidade']}")
#     return render(request, 'dietas.html', {'dietas': lista_dieta, 'compdieta':comp_dieta, 'lista_totais': lista_totais_fornecidos, 'alimentos': alimentos})
from decimal import Decimal

def dietas(request):
    lista_dieta = Dieta.objects.get(pk=1)
    comp_dieta = ComposicaoDieta.objects.filter(dieta=lista_dieta)

    # Totais agregados (como você já fez)
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
