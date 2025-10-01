from django.shortcuts import render
from faker import Faker


# Create your views here.
def animais(request):
    fake = Faker('pt_BR')
    print(fake.name())
    return render(request, 'animais.html')