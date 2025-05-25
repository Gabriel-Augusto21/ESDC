from django.shortcuts import render
from alimentos.models import Classificacao, Alimento

def nutrientes(requisicao):
   return render(requisicao, 'nutrientes.html')

def classificacao(req):
   classificacao = Classificacao.objects.all()
   return render(req, 'classificacao.html', {"classificacao": classificacao})

def alimentos(requisicao):
   alimentos = Alimento.objects.all()
   return render(requisicao, 'alimentos.html', {"alimentos": alimentos})