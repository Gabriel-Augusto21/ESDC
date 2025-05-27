from django.shortcuts import render
from alimentos.models import Classificacao, Alimento, Nutriente
from django.http import JsonResponse as js
from django.contrib import messages

# NUTRIENTES
def nutrientes(request):
   nutrientes = Nutriente.objects.all().order_by('id')
   return render(request, 'nutrientes.html', {"nutrientes": nutrientes})

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
      nutriente = Nutriente.objects.filter(nome=nome).exists()

      if not nutriente:
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
   if request.GET.get('id'):
      id = request.GET.get('id')
      
      nutriente = Nutriente.objects.get(id=id)
      if not nutriente:
         return js({'nutriente': 'Não existe'})
      nutriente.delete()
      return js({'nutriente': 'DELETADO'})
   return js({'nutriente': 'Preciso de uma id'})
   
# CLASSIFICAÇÃO
def classificacao(request):
   classificacao = Classificacao.objects.all()
   return render(request, 'classificacao.html', {"classificacao": classificacao})

def inserir_classificacao(req):
   pass

# ALIMENTOS
def alimentos(request):
   alimentos = Alimento.objects.all()
   return render(request, 'alimentos.html', {"alimentos": alimentos})