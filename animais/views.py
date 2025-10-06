from django.shortcuts import render
from faker import Faker
from animais.models import Animal


# Create your views here.
def animais(request):
    fake = Faker('pt_BR')
    print(fake.name())
    animais = Animal.objects.all()
    return render(request, 'animais.html', {'animais': animais})