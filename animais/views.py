from django.shortcuts import render
from animais.models import Animal

def animais(request):
    animais = Animal.objects.all()
    return render(request, 'animais.html', {'animais': animais})