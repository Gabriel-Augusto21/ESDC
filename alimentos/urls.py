from django.urls import path
from . import views
app_name = 'alimentos'

urlpatterns = [
    path("", views.nutrientes, name="nutrientes"),
    path("nutrientes/", views.nutrientes, name="nutrientes"),
    path("classificacao/", views.classificacao, name="classificacao"),
    path("alimentos/", views.alimentos, name="alimentos"),
]
