from django.shortcuts import render
from alimentos.models import Classificacao, Alimento, Nutriente

def nutrientes(requisicao):
   nutrientes = Nutriente.objects.all()
   return render(requisicao, 'nutrientes.html', {"nutrientes": nutrientes})

def classificacao(req):
   classificacao = Classificacao.objects.all()
   return render(req, 'classificacao.html', {"classificacao": classificacao})

def alimentos(requisicao):
   alimentos = Alimento.objects.all()
   return render(requisicao, 'alimentos.html', {"alimentos": alimentos})