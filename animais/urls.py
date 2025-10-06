from django.urls import path
from . import views

app_name = 'animais'

urlpatterns = [
   path("animais/", views.animais, name="animais"),
]