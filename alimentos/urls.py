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
]
