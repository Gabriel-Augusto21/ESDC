from django.shortcuts import render
from animais.models import Animal
from django.core.paginator import Paginator
from django.http import JsonResponse
from datetime import date

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
        return JsonResponse({'Mensagem': 'Método não permitido.'}, status=405)

    nome = request.POST.get('nome', '').strip()
    proprietario = request.POST.get('proprietario', '').strip()
    peso_vivo = request.POST.get('peso_vivo', '').strip()
    data_nasc = request.POST.get('data_nasc', '').strip()
    genero = request.POST.get('genero', '').strip()
    imagem = request.FILES.get('imagem')

    if not nome:
        return JsonResponse({'Mensagem': 'O campo "Nome" é obrigatório.'}, status=400)
    if len(nome) < 3:
        return JsonResponse({'Mensagem': 'O nome do animal deve ter pelo menos 3 caracteres.'}, status=400)

    try:
        peso_vivo = float(peso_vivo)
        if peso_vivo <= 0:
            return JsonResponse({'Mensagem': 'O peso deve ser maior que zero.'}, status=400)
        if peso_vivo > 2000:
            return JsonResponse({'Mensagem': 'Peso muito alto para um cavalo. Verifique o valor informado.'}, status=400)
    except ValueError:
        return JsonResponse({'Mensagem': 'O campo "Peso vivo" deve ser um número válido.'}, status=400)

    try:
        data_nasc = date.fromisoformat(data_nasc)
        if data_nasc > date.today():
            return JsonResponse({'Mensagem': 'A data de nascimento não pode ser futura.'}, status=400)
    except ValueError:
        return JsonResponse({'Mensagem': 'Data de nascimento inválida.'}, status=400)

    if proprietario and len(proprietario) < 3:
        return JsonResponse({'Mensagem': 'O nome do proprietário deve ter pelo menos 3 caracteres.'}, status=400)

    animal_data = {
        'nome': nome,
        'proprietario': proprietario,
        'peso_vivo': peso_vivo,
        'data_nasc': data_nasc,
        'genero': genero,
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

def desativar_animal(request):
    id = request.GET.get('id')
    animal = Animal.objects.get(id=id)
    animal.is_active = False
    animal.save()
    return JsonResponse({'Mensagem': f'{animal.nome} foi desativado'}, status=200)
    
def ativar_animal(request):
    id = request.GET.get('id')
    animal = Animal.objects.get(id=id)
    animal.is_active = True
    animal.save()
    return JsonResponse({'Mensagem': f'{animal.nome} foi ativado'}, status=200)

def atualizar_animal(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        nome = request.POST.get('nome')
        dono = request.POST.get('dono')
        peso = request.POST.get('peso')
        genero = request.POST.get('genero')
        data_nasc = request.POST.get('data_nasc')
        imagem = request.FILES.get('imagem')  # pode ser None se o usuário não trocou
        try:
            animal = Animal.objects.get(id=id)
            animal.nome = nome
            animal.proprietario = dono
            animal.peso_vivo = peso
            animal.genero = genero
            animal.data_nasc = data_nasc
            if imagem:
                animal.imagem = imagem  # substitui a imagem existente
            animal.save()
            return JsonResponse({'Mensagem': 'Animal atualizado com sucesso!'}, status=200)
        except Animal.DoesNotExist:
            return JsonResponse({'erro': 'Animal não encontrado'}, status=404)

    return JsonResponse({'erro': 'Método não permitido'}, status=405)