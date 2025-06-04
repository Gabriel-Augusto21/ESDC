from django.urls import path
from . import views

app_name = 'alimentos'

urlpatterns = [
   path("", views.alimentos, name="alimentos"),
   
   path("nutrientes/", views.nutrientes, name="nutrientes"),
   path("inserir_nutriente/", views.inserir_nutriente, name="inserir_nutriente"),
   path("desativar_nutriente/", views.desativar_nutriente, name="desativar_nutriente"),
   path("atualizar_nutriente/", views.atualizar_nutriente, name="atualizar_nutriente"),
   path("ativar_nutriente/", views.ativar_nutriente, name="ativar_nutriente"),
   path("busca_nutriente_nome/", views.busca_nutriente_nome, name="busca_nutriente_nome"),
   path("get_nutriente/", views.get_nutriente, name="get_nutriente"),
   path("listar_nutrientes/", views.listar_nutrientes, name="listar_nutrientes"),

   path("alimentos/", views.alimentos, name="alimentos"),
   path("busca_alimento_nome/", views.busca_alimento_nome, name="busca_alimento_nome"),
   path("inserir_alimento/", views.inserir_alimento, name="inserir_alimento"),
   path("atualizar_alimento/", views.atualizar_alimento, name="atualizar_alimento"),
   path("apagar_alimento/", views.apagar_alimento, name="apagar_alimento"),
   path("ativar_alimento/", views.ativar_alimento, name="ativar_alimento"),
   path("desativar_alimento/", views.desativar_alimento, name="desativar_alimento"),


   path("classificacao/", views.classificacao, name="classificacao"),   
   path("get_classificacao/", views.get_classificacao, name="get_classificacao"),
   path("inserir_classificacao/", views.inserir_classificacao, name="inserir_classificacao"),
   path("ativar_classificacao/", views.ativar_classificacao, name="ativar_classificacao"),
   path("desativar_classificacao/", views.desativar_classificacao, name="desativar_classificacao"),
   path("atualizar_classificacao/", views.atualizar_classificacao, name="atualizar_classificacao"),
   path("listar_classificacoes/", views.listar_classificacoes, name="listar_classificacoes"),
]