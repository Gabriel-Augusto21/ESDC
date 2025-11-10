from django.shortcuts import render
#from django.contrib.auth.decorators import login_required

#@login_required
def main(request):
    return render(request, "main.html")

def nois(request):
    return render(request, "nois.html")