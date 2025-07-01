from django.shortcuts import render
from exigencias.models import CategoriaAnimal, Exigencia, ComposicaoExigencia
from django.http import  JsonResponse as js
from django.core.paginator import Paginator
from django.conf import settings


# NUTRIENTES
def exigencias(request):
    query = request.GET.get('query', '')
    exigencia_lista = Exigencia.objects.filter(nome__icontains=query).order_by('-is_active', 'nome')
    paginator = Paginator(exigencia_lista, 10)
    page_obj = paginator.get_page(request.GET.get('page'))

    return render(request, 'exigencias.html', {
        'exigencias': page_obj,
        'page_obj': page_obj,
        'query': query
    })
