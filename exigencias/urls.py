from django.urls import path
from . import views

app_name = 'exigencias'

urlpatterns = [
   path("", views.exigencias, name="exigencias"),
   
   path("exigencias/", views.exigencias, name="exigencias"),
]