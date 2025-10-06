from django.urls import path
from . import views

app_name = 'exigencias'

urlpatterns = [
   path("", views.exigencias, name="exigencias"),
   
   path("exigencias/", views.exigencias, name="exigencias"),
   path("get_exigencia/", views.get_exigencia, name="get_exigencia"),
   path("get_categorias/", views.get_categorias, name="get_categorias"),
   path("buscar_exigencia/", views.busca_exigencia_nome, name="buscar_exigencia"),
   path("inserir_exigencia/", views.inserir_exigencia, name="inserir_exigencia"),
   path("atualizar_exigencia/", views.atualizar_exigencia, name="atualizar_exigencia"),
   path("ativar_exigencia/", views.ativar_exigencia, name="ativar_exigencia"),
   path("desativar_exigencia/", views.desativar_exigencia, name="desativar_exigencia"),

   path("composicaoExigencia/", views.composicaoExigencia, name="composicaoExigencia"),
   path("composicao_exigencia_json/", views.composicao_exigencia_json, name="composicao_exigencia_json"),
   path("nutrientes_disponiveis_exigencia_json/", views.nutrientes_disponiveis_json, name="nutrientes_disponiveis_json"),
   path("get_composicaoExigencia/", views.get_composicaoExigencia, name="get_composicaoExigencia"),
   path("busca_composicaoExigencia_nome/", views.busca_composicaoExigencia_nome, name="busca_composicaoExigencia_nome"),
   path("inserir_composicao_exigencia/", views.inserir_composicao_exigencia, name="inserir_composicao_exigencia"),
   path("atualizar_composicaoExigencia/", views.atualizar_composicaoExigencia, name="atualizar_composicaoExigencia"),
   path("desativar_composicaoExigencia/", views.desativar_composicaoExigencia, name="desativar_composicaoExigencia"),
   path("ativar_composicaoExigencia/", views.ativar_composicaoExigencia, name="ativar_composicaoExigencia"),
   path("listar_composicaoExigencia/", views.listar_composicaoExigencia, name="listar_composicaoExigencia"),
   path("listar_exigencias_nutrientes/", views.listar_exigencias_nutrientes, name="listar_exigencias_nutrientes"),
   path("_get_or_create_or_update_categoria/", views._get_or_create_or_update_categoria, name="_get_or_create_or_update_categoria"),
]