from django.shortcuts import render

def nutrientes(requisicao):
   return render(requisicao, 'nutrientes.html')

def classificacao(req):
   return render(req, 'classificacao.html')

def alimentos(requisicao):
   return render(requisicao, 'alimentos.html')