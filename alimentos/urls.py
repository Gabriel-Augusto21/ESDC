from django.urls import path
from . import views

app_name = 'alimentos'

urlpatterns = [
   path("", views.alimentos, name="alimentos"),
   path("nutrientes/", views.nutrientes, name="nutrientes"),
   path("classificacao/", views.classificacao, name="classificacao"),
   path("alimentos/", views.alimentos, name="alimentos"),
   path("inserir_nutriente/", views.inserir_nutriente, name="inserir_nutriente"),
   path("apagar_nutriente/", views.apagar_nutriente, name="apagar_nutriente"),
   path("atualizar_nutriente/", views.atualizar_nutriente, name="atualizar_nutriente"),
   path("busca_nutriente_nome/", views.busca_nutriente_nome, name="busca_nutriente_nome"),
   path("busca_alimento_nome/", views.busca_alimento_nome, name="busca_alimento_nome"),
   path("inserir_alimento/", views.inserir_alimento, name="inserir_alimento"),
   path("atualizar_alimento/", views.atualizar_alimento, name="atualizar_alimento"),
   path("apagar_alimento/", views.apagar_alimento, name="apagar_alimento"),
   path("apagar_classificacao/", views.apagar_classificacao, name="apagar_classificacao"),
   path("get_classificacao/", views.get_classificacao, name="get_classificacao"),
]