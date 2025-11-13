from django.urls import path
from . import views

app_name = 'animais'

urlpatterns = [
   path("animais/", views.animais, name="animais"),
   path("inserir_animal/", views.inserir_animal, name="inserir_animal"),
   path("atualizar_animal/", views.atualizar_animal, name="atualizar_animal"),
   path("desativar_animal/", views.desativar_animal, name="desativar_animal"),
   path("ativar_animal/", views.ativar_animal, name="desativar_animal"),
   path("editar_animais/", views.editar_animais, name="editar_animais"),
   path('api/animal/<int:animal_id>/dieta_atual/', views.verificar_dieta_atual, name='verificar_dieta_atual'),

]