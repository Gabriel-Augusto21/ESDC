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
   path("alimento_json/", views.alimento_json, name="alimento_json"),
   path("busca_alimento_nome/", views.busca_alimento_nome, name="busca_alimento_nome"),
   path("inserir_alimento/", views.inserir_alimento, name="inserir_alimento"),
   path("atualizar_alimento/", views.atualizar_alimento, name="atualizar_alimento"),
   path("apagar_alimento/", views.apagar_alimento, name="apagar_alimento"),
   path("desativar_alimento/", views.desativar_alimento, name="desativar_alimento"),
   path("ativar_alimento/", views.ativar_alimento, name="ativar_alimento"),
   
   path("classificacao/", views.classificacao, name="classificacao"),   
   path('classificacoes_json/', views.classificacoes_json, name='classificacoes_json'),
   path("get_classificacao/", views.get_classificacao, name="get_classificacao"),
   path("inserir_classificacao/", views.inserir_classificacao, name="inserir_classificacao"),
   path("ativar_classificacao/", views.ativar_classificacao, name="ativar_classificacao"),
   path("desativar_classificacao/", views.desativar_classificacao, name="desativar_classificacao"),
   path("atualizar_classificacao/", views.atualizar_classificacao, name="atualizar_classificacao"),
   path("listar_classificacoes/", views.listar_classificacoes, name="listar_classificacoes"),

   path("composicaoAlimento/", views.composicaoAlimento, name="composicaoAlimento"),
   path("composicao_json/", views.composicao_json, name="composicao_json"),
   path("get_composicaoAlimento/", views.get_composicaoAlimento, name="get_composicaoAlimento"),
   path("inserir_composicaoAlimento/", views.inserir_composicaoAlimento, name="inserir_composicaoAlimento"),
   path("ativar_composicaoAlimento/", views.ativar_composicaoAlimento, name="ativar_composicaoAlimento"),
   path("desativar_composicaoAlimento/", views.desativar_composicaoAlimento, name="desativar_composicaoAlimento"),
   path("atualizar_composicaoAlimento/", views.atualizar_composicaoAlimento, name="atualizar_composicaoAlimento"),
   path("listar_composicaoAlimento/", views.listar_composicaoAlimento, name="listar_composicaoAlimento"),
   path('listar_alimentos_nutrientes/', views.listar_alimentos_nutrientes, name='listar_alimentos_nutrientes'),
]