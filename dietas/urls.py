from django.urls import path
from . import views

app_name = 'dietas'

urlpatterns = [
    path("dietas/", views.dietas, name="dietas"),   
    path("gerenciar_dietas/<int:id>/", views.gerenciar_dietas, name='gerenciar_dietas'),
    path("desativar_dieta/", views.desativar_dieta, name="desativar_dieta"),   
    path("ativar_dieta/", views.ativar_dieta, name="ativar_dieta"),   
]