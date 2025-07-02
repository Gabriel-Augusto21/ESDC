from django.urls import path
from . import views

app_name = 'exigencias'

urlpatterns = [
   path("", views.exigencias, name="exigencias"),
   
   path("exigencias/", views.exigencias, name="exigencias"),
   path("get_exigencia/", views.get_exigencia, name="get_exigencia"),
   path("buscar_exigencia/", views.busca_exigencia_nome, name="buscar_exigencia"),
   path("inserir_exigencia/", views.inserir_exigencia, name="inserir_exigencia"),
   path("atualizar_exigencia/", views.atualizar_exigencia, name="atualizar_exigencia"),
   path("ativar_exigencia/", views.ativar_exigencia, name="ativar_exigencia"),
   path("desativar_exigencia/", views.desativar_exigencia, name="desativar_exigencia"),
   path("listar_composicoes_exigencia/", views.listar_composicoes_exigencia, name="listar_composicoes_exigencia"),
]