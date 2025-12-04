from django.urls import path
from . import views

app_name = 'dietas'

urlpatterns = [
    path("dietas/", views.dietas, name="dietas"),   
    path("gerenciar_dietas/<int:id>/", views.gerenciar_dietas, name='gerenciar_dietas'),
    path("desativar_dieta/", views.desativar_dieta, name="desativar_dieta"),   
    path("ativar_dieta/", views.ativar_dieta, name="ativar_dieta"),
    path("inserir_dieta/", views.inserir_dieta, name="inserir_dieta"),
    path("add_item_dieta_temp/", views.add_item_dieta_temp, name="add_item_dieta_temp"),
    path("remover_item_dieta_temp/", views.remover_item_dieta_temp, name="remover_item_dieta_temp"),
    path("atualizar_quantidade_dieta_temp/", views.atualizar_quantidade_dieta_temp, name="atualizar_quantidade_dieta_temp"),
    path("calcular_balanceamento_dinamico/", views.calcular_balanceamento_dinamico, name="calcular_balanceamento_dinamico"),
    path("inserir_dieta_dois/", views.inserir_dietas_dois, name="inserir_dietas_dois"),
    path("inserir_dieta_tres/", views.inserir_dietas_tres, name="inserir_dietas_tres"),
    path('api/animal/<int:animal_id>/dieta_atual/', views.verificar_dieta_atual, name='verificar_dieta_atual'),
    path('get-nutrientes-alimento/', views.get_nutrientes_alimento, name='get_nutrientes_alimento'),
]