from django.urls import path
from . import views

app_name = 'dietas'

urlpatterns = [
    path("dietas/", views.dietas, name="dietas"),   
    path("dieta/<int:id>/", views.dieta, name="dieta"),   
]