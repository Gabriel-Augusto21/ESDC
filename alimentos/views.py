from django.shortcuts import render
from alimentos.models import Classificacao, Alimento, Nutriente
from django.http import JsonResponse as js
from django.http import HttpResponse
from django.core.paginator import Paginator
from django.conf import settings
from django.forms.models import model_to_dict

# NUTRIENTES
def nutrientes(request):
   nutriente_lista = Nutriente.objects.all().order_by('nome')
   paginator = Paginator(nutriente_lista, settings.NUMBER_GRID_PAGES)
   numero_pagina = request.GET.get('page')
   page_obj = paginator.get_page(numero_pagina)
   return render(request, 'nutrientes.html', {"nutrientes": page_obj, "page_obj": page_obj})

def busca_nutriente_nome(request):
   if request.GET.get('nome'):
      nutriente = Nutriente.objects.filter(nome=request.GET.get('nome'))
      if not nutriente.exists():
         return js({'nutrientes': 'Não existe'})
      return js({'nutriente': list(nutriente.values())})
   return js({'nutriente': 'Informe um nome'})

# CRUD NURIENTES
def inserir_nutriente(request):
   if request.GET.get('nome') and request.GET.get('unidade'):
      nome = request.GET.get('nome')
      unidade = request.GET.get('unidade')
      nutriente = Nutriente.objects.filter(nome=nome)

      if not nutriente.exists():
         Nutriente.objects.create(nome=nome, unidade=unidade)
         return js({'nutrientes': f'{nome} adicionado com sucesso!'})
      return js({'nutrientes': 'Nutriente já existente'})
   return js({'nutrientes': 'Informe nome e unidade'})

def atualizar_nutriente(request):
   if request.GET.get('id') and request.GET.get('nome'):
      id = request.GET.get('id')
      nome = request.GET.get('nome')
      nutriente = Nutriente.objects.get(id=id)
      if nutriente.nome != nome and not Nutriente.objects.filter(nome=nome).exists():
         nutriente.nome = nome
         nutriente.save()
         return js({'nutriente': "Nutriente Salvo"})
      return js({'nutriente': 'Esse de nutriente já existe'})
   return js({'nutriente': 'Preciso de um nome e uma id'})
   
def apagar_nutriente(request):
   if request.POST.get('id'):
      id = request.GET.get('id')
      
      nutriente = Nutriente.objects.get(id=id)
      if not nutriente:
         return js({'nutriente': 'Não existe'})
      nutriente.delete()
      return js({'nutriente': 'DELETADO'})
   return js({'nutriente': 'Preciso de uma id'})
   
# CLASSIFICAÇÃO
def classificacao(request):
   classificacao_lista = Classificacao.objects.all().order_by('-is_active', 'nome')
   paginator = Paginator(classificacao_lista, settings.NUMBER_GRID_PAGES)
   numero_pagina = request.GET.get('page')
   page_obj = paginator.get_page(numero_pagina)
   return render(request, 'classificacao.html', {"classificacoes": page_obj, 'page_obj': page_obj})

def get_classificacao(request):
   return render(request, 'classificacao.html', {})

def inserir_classificacao(req):
   nome = req.GET.get('nome')
   if nome:
      if not Classificacao.objects.filter(nome=nome).exists():
         Classificacao.objects.create(nome=nome)
         return js({'Mensagem': f'{nome} inserido com sucesso!'})
      else:
         return js({'Mensagem': f'{nome} já existe na base de dados'}, status=400)
   return js({'Mensagem': f'{nome} não pode ser inserido'}, status=400)

def atualizar_classificacao(req):
   id = req.GET.get('id')
   nome = req.GET.get('nome')
   if id:   
      item = Classificacao.objects.get(id=id)
      item.nome = nome
      item.save()
      return js({'Mensagem': f'{nome} Atualizado com sucesso!'})

   return js({'Mensagem': f'{nome} não pode ser atualizada!'})

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

# ALIMENTOS
def alimentos(request):
   nutriente_lista = Alimento.objects.all().order_by('nome')
   paginator = Paginator(nutriente_lista, settings.NUMBER_GRID_PAGES)
   numero_pagina = request.GET.get('page')
   page_obj = paginator.get_page(numero_pagina)
   return render(request, 'alimentos.html', {"alimentos": page_obj, "page_obj": page_obj})

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