from django.urls import path
from . import views

app_name = 'dietas'

urlpatterns = [
    path("dietas/", views.dietas, name="dietas"),   
    path("dieta/<int:id>/", views.dieta, name="dieta"),   
    path("desativar_dieta/", views.desativar_dieta, name="desativar_dieta"),   
    path("ativar_dieta/", views.ativar_dieta, name="ativar_dieta"),   

]