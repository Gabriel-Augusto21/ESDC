from django.shortcuts import render, get_object_or_404
from alimentos.models import Classificacao, Alimento, Nutriente
from django.http import  JsonResponse as js
from django.core.paginator import Paginator
from django.conf import settings

# NUTRIENTES
def nutrientes(request):
    query = request.GET.get('query', '')
    nutrientes_lista = Nutriente.objects.filter(nome__icontains=query).order_by('-is_active', 'nome')
    paginator = Paginator(nutrientes_lista, getattr(settings, 'NUMBER_GRID_PAGES', 10))
    page_obj = paginator.get_page(request.GET.get('page'))

    return render(request, 'nutrientes.html', {
        'nutrientes': page_obj,
        'page_obj': page_obj,
        'query': query
    })

def get_nutriente(request):
    if request.method == "GET":
        id = request.GET.get("id")
        try:
            nutriente = Nutriente.objects.get(id=id)
            data = {
                "id": nutriente.id,
                "nome": nutriente.nome,
                "descricao": nutriente.descricao,
                # adicione outros campos que desejar
            }
            return js(data)
        except Nutriente.DoesNotExist:
            return js({"error": "Nutriente não encontrado"}, status=404)

def busca_nutriente_nome(request):
    nome = request.GET.get('nome', '')
    if nome:
        nutrientes = Nutriente.objects.filter(nome__icontains=nome)
        if nutrientes.exists():
            return js({'nutrientes': list(nutrientes.values())})
        return js({'mensagem': 'Nutriente não encontrado'})
    return js({'mensagem': 'Informe um nome para busca'}, status=400)


def inserir_nutriente(request):
    nome = request.GET.get('nome', '')
    unidade = request.GET.get('unidade', '')
    categoria = request.GET.get('categoria', '')

    if nome and unidade:
        if Nutriente.objects.filter(nome__iexact=nome).exists():
            
            return js({'Mensagem': f'{nome} já existe'}, status=400)
        Nutriente.objects.create(nome=nome, unidade=unidade, categoria=categoria)
        return js({'Mensagem': f'{nome} inserido com sucesso!'}, status=400)
    return js({'Mensagem': 'Informe nome e unidade'}, status=400)

def atualizar_nutriente(request):
    id = request.GET.get('id')
    nome = request.GET.get('nome')
    unidade = request.GET.get('unidade')
    categoria = request.GET.get('categoria')

    if not id or not nome or not unidade:
        return js({'Mensagem': 'Parâmetros incompletos'}, status=400)

    nutriente = get_object_or_404(Nutriente, pk=id)

    if Nutriente.objects.filter(nome=nome).exists():
        return js({'Mensagem': f'{nome} já existe!'}, status=400)

    if Nutriente.objects.exclude(id=id).filter(nome__iexact=nome).exists():
        return js({'Mensagem': 'Erro: Outro nutriente já existe com esse nome.'}, status=400)

    nutriente.nome = nome
    nutriente.unidade = unidade
    nutriente.categoria = categoria or None
    nutriente.save()
    return js({'Mensagem': 'Nutriente atualizado com sucesso!'}, status=200)


def ativar_nutriente(request):
    id = request.GET.get('id')
    nutriente = get_object_or_404(Nutriente, pk=id)
    nutriente.is_active = True
    nutriente.save()
    return js({'Mensagem': f'{nutriente.nome} foi ativado'})


def desativar_nutriente(request):
    id = request.GET.get('id')
    if id:
      nutriente = get_object_or_404(Nutriente, pk=id)
      nutriente.is_active = False
      nutriente.save()
      return js({'Mensagem': f'{nutriente.nome} foi desativado'})
    return js({'Mensagem': f'Não foi possível desativar {nutriente.nome}'}, status=400)

def listar_nutrientes(request):
    query = request.GET.get('query', '').strip()
    nutrientes = Nutriente.objects.all()

    if query:
        nutrientes = nutrientes.filter(nome__icontains=query)
    
    nutrientes = nutrientes.order_by('nome')

    paginator = Paginator(nutrientes, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'nutrientes': page_obj.object_list,
        'page_obj': page_obj,
        'query': query,
    }

# CLASSIFICAÇÃO
def classificacao(request):
    query = request.GET.get('query', '')
    classificacoes_lista = Classificacao.objects.filter(nome__icontains=query).order_by('-is_active', 'nome')
    paginator = Paginator(classificacoes_lista, getattr(settings, 'NUMBER_GRID_PAGES', 10))
    page_obj = paginator.get_page(request.GET.get('page'))

    return render(request, 'classificacao.html', {
        'classificacoes': page_obj,
        'page_obj': page_obj,
        'query': query
    })

def get_classificacao(request):
   return render(request, 'classificacao.html', {})

def inserir_classificacao(req):
   nome = req.GET.get('nome')
   if nome:
      if not Classificacao.objects.filter(nome__iexact=nome).exists():
         Classificacao.objects.create(nome=nome)
         return js({'Mensagem': f'{nome} inserido com sucesso!'})
      else:
         return js({'Mensagem': f'{nome} já existe na base de dados'}, status=400)
   return js({'Mensagem': f'{nome} não pode ser inserido'}, status=400)

def atualizar_classificacao(request):
    id = request.GET.get('id')
    nome = request.GET.get('nome')

    if not id or not nome:
        return js({'Mensagem': 'Parâmetros incompletos'}, status=400)

    classificacao = get_object_or_404(Classificacao, pk=id)

    if Classificacao.objects.filter(nome=nome).exists():
        return js({'Mensagem': f'{nome} já existe!'}, status=400)

    if Classificacao.objects.exclude(id=id).filter(nome__iexact=nome).exists():
        return js({'Mensagem': 'Erro: Outra classificação já existe com esse nome.'}, status=400)

    classificacao.nome = nome
    classificacao.save()
    return js({'Mensagem': 'Classificação atualizada com sucesso!'}, status=200)

def ativar_classificacao(req):
   teste = req.GET.get('id')
   if teste:
      item = Classificacao.objects.get(id=teste)
      item.is_active = True
      item.save()
   return js({'Mensagem': f'{item.nome} foi desativado'})

def desativar_classificacao(req):
   teste = req.GET.get('id')
   if teste:
      item = Classificacao.objects.get(id=teste)
      item.is_active = False
      item.save()
   return js({'Mensagem': f'{item.nome} foi desativado'})

def listar_classificacoes(request):
    query = request.GET.get('query', '').strip()
    classificacoes = Classificacao.objects.all()

    if query:
        classificacoes = classificacoes.filter(nome__icontains=query)

    classificacoes = classificacoes.order_by('nome')

    paginator = Paginator(classificacoes, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'classificacoes': page_obj, 
        'page_obj': page_obj,
        'query': query,
    }
    
    
# ALIMENTOS
def alimentos(request):
   nutriente_lista = Alimento.objects.all().order_by('nome')
   paginator = Paginator(nutriente_lista, settings.NUMBER_GRID_PAGES)
   numero_pagina = request.GET.get('page')
   page_obj = paginator.get_page(numero_pagina)
   classificacoes = list(Classificacao.objects.values('nome')) 
   return render(request, 'alimentos.html', {"alimentos": page_obj, "page_obj": page_obj, "classificacoes": classificacoes})

def busca_alimento_nome(request):
   if request.GET.get('nome'):
      alimento = Alimento.objects.filter(nome=request.GET.get('nome'))
      if not alimento.exists():
         return js({'alimentos': 'Não existe'})
      return js({'alimentos': list(alimento.values())})
   return js({'alimento': 'Informe um nome'})

def inserir_alimento(request):
    if request.GET.get('nome') and request.GET.get('id_classificacao'):
        nome = request.GET.get('nome')
        id_classificacao = request.GET.get('id_classificacao')

        alimento_existente = Alimento.objects.filter(nome=nome)
        if not alimento_existente.exists():
            try:
                classificacao = Classificacao.objects.get(id=id_classificacao)

                Alimento.objects.create(nome=nome, classificacao_id=classificacao.id)
                return js({'alimento': f'{nome} adicionado com sucesso!'})
            except Classificacao.DoesNotExist:
                return js({'alimento': 'Classificação informada não existe'})
        return js({'alimento': 'Alimento já existente'})
    return js({'alimento': 'Informe nome e id_classificacao'})

def atualizar_alimento(request):
    if request.GET.get('id') and request.GET.get('nome'):
        id_alimento = request.GET.get('id')
        nome = request.GET.get('nome')
        id_classificacao = request.GET.get('id_classificacao')
        
        try:
            alimento = Alimento.objects.get(id_alimento=id_alimento)
            if alimento.nome != nome and Alimento.objects.filter(nome=nome).exists():
                return js({'alimento': 'Esse nome de alimento já existe'})
            
            alimento.nome = nome
            if id_classificacao:
                try:
                    classificacao = Classificacao.objects.get(id_classificacao=id_classificacao)
                    alimento.id_classificacao = classificacao
                except Classificacao.DoesNotExist:
                    return js({'alimento': 'Classificação informada não existe'})
            alimento.save()
            return js({'alimento': 'Alimento atualizado com sucesso'})
        except Alimento.DoesNotExist:
            return js({'alimento': 'Alimento não encontrado'})
    return js({'alimento': 'Preciso de um id e um nome'})

def apagar_alimento(request):
    if request.GET.get('id'):
        id_alimento = request.GET.get('id')
        try:
            alimento = Alimento.objects.get(id=id_alimento)
            alimento.delete()
            return js({'alimento': 'DELETADO'})
        except Alimento.DoesNotExist:
            return js({'alimento': 'Alimento não encontrado'})
    return js({'alimento': 'Preciso de uma id'})

def ativar_alimento(request):
    id = request.POST.get('id')
    nome = request.POST.get('nome')
    print(id)
    if id:
        item = Alimento.objects.get(id=id)
        if item.is_active == False:
            item.is_active = True
            item.save()
            return js({'Mensagem': f'"{nome}" ativado com sucesso!'}, status=200)
        else:
            return js({'Mensagem': 'Esse alimento ja esta ativo!'}, status=400)

    else:
        return js({'Mensagem': 'Alguma coisa deu errado'}, status=400)
    

def desativar_alimento(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        nome = request.POST.get('nome')
        if id:
            item = Alimento.objects.get(id=id)
            if item.is_active == True:
                item.is_active = False
                item.save()
                return js({'Mensagem': f'"{nome}" desativado com sucesso!'}, status=200)
            else:
                return js({'Mensagem': 'Esse alimento ja esta desativado!'}, status=400)

    return js({'Mensagem': 'Alguma coisa deu errado'}, status=400)
