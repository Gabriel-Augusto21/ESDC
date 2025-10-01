from django.shortcuts import render

# Create your views here.
def animais(request):
    return render(request, 'animais.html')