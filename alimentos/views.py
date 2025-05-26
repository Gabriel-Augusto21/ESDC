from django.shortcuts import render
from alimentos.models import Classificacao, Alimento, Nutriente
from django.http import JsonResponse as js
from django.contrib import messages


# NUTRIENTES
def nutrientes(request):
   nutrientes = Nutriente.objects.all()
   return render(request, 'nutrientes.html', {"nutrientes": nutrientes})

def busca_nutriente_nome(request):
   nutriente = Nutriente.objects.filter(nome=request.GET.get('nome'))
   if not nutriente.exists():
      return js({'nutrientes': 'Não existe'})
   return js({'nutriente': list(nutriente.values())})

# CRUD NURIENTES
def inserir_nutriente(request):
   nome = request.GET.get('nome')
   unidade = request.GET.get('unidade')
   nutriente = Nutriente.objects.filter(nome=nome)

   if not nutriente.exists():
      Nutriente.objects.create(nome=nome, unidade=unidade)
      return js({'nutrientes': f'{nome} adicionado com sucesso!'})
   return js({'nutrientes': 'Nutriente já existente'})

def atualizar_nutriente(request):# Fazendo apenas a Busca
   nutriente = Nutriente.objects.filter(id=request.GET.get('id'))
   if not nutriente.exists():
      return js({'nutrientes': 'Não existe'})
   return js({'nutrientes': 'Existe'})

def apagar_nutriente(request):# Fazendo apenas a Busca
   nutriente = Nutriente.objects.filter(nome=request.GET.get('nome'))
   if not nutriente:
      return js({'nutrientes': 'Não existe'})
   return js({'nutrientes': 'Existe'})
   

# CLASSIFICAÇÃO
def classificacao(request):
   classificacao = Classificacao.objects.all()
   return render(request, 'classificacao.html', {"classificacao": classificacao})

def inserir_classificacao(req):
   pass

# Nutrientes 
def alimentos(request):
   alimentos = Alimento.objects.all()
   return render(request, 'alimentos.html', {"alimentos": alimentos})
