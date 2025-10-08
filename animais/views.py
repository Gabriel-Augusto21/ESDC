from django.shortcuts import render
from animais.models import Animal
from django.core.paginator import Paginator

def animais(request):
    query = request.GET.get('query', '')
    animais_lista = Animal.objects.filter(
        nome__icontains=query
    ).order_by('-is_active', 'nome', 'peso_vivo')  
    paginator = Paginator(animais_lista, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'animais.html', {'page_obj': page_obj, 'query': query})

def inserir_animal(request):
    if request.method != "POST":
        return js({'Mensagem': 'Método não permitido'}, status=405)

    nome = request.POST.get('nome', '').strip()
    imagem = request.FILES.get('imagem')
    proprietario = request.POST.get('proprietario', '').strip()
    peso_vivo = request.POST.get('peso_vivo')
    data_nasc = request.POST.get('data_nasc')
    genero = request.POST.get('genero')

    if not nome:
        return js({'Mensagem': 'Nome é obrigatório'}, status=400)

    imagem = None

    Animal.objects.create(
        nome=nome,
        imagem=imagem,
        proprietario=proprietario,
        peso_vivo=peso_vivo,
        data_nasc=data_nasc,
        genero=genero
    )

    mensagem = f'{nome} inserido com sucesso!'
    return js({'Mensagem': mensagem}, status=200)