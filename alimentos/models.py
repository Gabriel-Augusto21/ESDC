from django.db import models

# Create your models here.
class Classificacao(models.Model):
    nome= models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
     return f"Nome = {self.nome})"
    
class Alimento(models.Model):
    classificacao = models.ForeignKey(Classificacao, on_delete=models.CASCADE)
    nome = models.CharField(max_length=255, null=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.nome

class Nutriente(models.Model):
    nome = models.CharField(max_length=255, null=False)
    categoria = models.CharField(max_length=255, null=True, blank=True)
    unidade = models.CharField(max_length=100, null=False)
    is_active = models.BooleanField(default=True)


    def __str__(self):
        return self.nome

class ComposicaoAlimento(models.Model):
    alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE)
    nutriente = models.ForeignKey(Nutriente, on_delete=models.CASCADE)
    valor = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.alimento} - {self.nutriente}: {self.quantidade}"
       

    