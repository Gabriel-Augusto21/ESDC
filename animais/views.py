from django.shortcuts import render
from animais.models import Animal
from django.core.paginator import Paginator

def animais(request):
    query = request.GET.get('query', '')
    animais_lista = Animal.objects.filter(
        nome__icontains=query
    ).order_by('-is_active', 'nome', 'peso_vivo')  
    paginator = Paginator(animais_lista, 12)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'animais.html', {'page_obj': page_obj, 'query': query})
