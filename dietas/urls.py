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
    path("calcular_balanceamento_dinamico/", views.calcular_balanceamento_dinamico, name="calcular_balanceamento_dinamico"),

]