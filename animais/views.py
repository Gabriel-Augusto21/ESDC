from django.shortcuts import render
from animais.models import Animal
from django.core.paginator import Paginator
from django.http import JsonResponse

def animais(request):
    query = request.GET.get('query', '')
    animais_lista = Animal.objects.filter(
        nome__icontains=query
    ).order_by('-is_active', 'nome', 'peso_vivo')  
    paginator = Paginator(animais_lista, 12)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'animais.html', {'page_obj': page_obj, 'query': query})

def inserir_animal(request):
    if request.method != "POST":
        return JsonResponse({'Mensagem': 'Método não permitido'}, status=405)

    nome = request.POST.get('nome', '').strip()
    proprietario = request.POST.get('proprietario', '').strip()
    peso_vivo = request.POST.get('peso_vivo')
    data_nasc = request.POST.get('data_nasc')
    genero = request.POST.get('genero')
    imagem = request.FILES.get('imagem')
    
    if not nome:
        return JsonResponse({'Mensagem': 'O campo "nome" é obrigatório.'}, status=400)
    if not peso_vivo:
        return JsonResponse({'Mensagem': 'O campo "peso vivo" é obrigatório.'}, status=400)
    if not data_nasc:
        return JsonResponse({'Mensagem': 'A data de nascimento é obrigatória.'}, status=400)
    if not genero:
        return JsonResponse({'Mensagem': 'O gênero é obrigatório.'}, status=400)

    animal_data = {
        'nome': nome,
        'proprietario': proprietario,
        'peso_vivo': peso_vivo,
        'data_nasc': data_nasc,
        'genero': genero
    }

    if imagem:
        animal_data['imagem'] = imagem

    animal = Animal.objects.create(**animal_data)

    return JsonResponse({'Mensagem': f'{animal.nome} inserido com sucesso!'}, status=200)


def editar_animais(request):
    query = request.GET.get('query', '')
    animais_lista = Animal.objects.filter(
        nome__icontains=query
    ).order_by('id', 'nome', 'peso_vivo')  
    paginator = Paginator(animais_lista, 12)
    page_obj = paginator.get_page(request.GET.get('page'))
    print("Passei aqui")
    return render(request, 'animais.html', {'page_obj': page_obj, 'query': query})
    