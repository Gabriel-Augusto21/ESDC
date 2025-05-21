from django.db import models

# Create your models here.
class Classificacao(models.Model):
    nome= models.CharField(max_length=100)

    def __str__(self):
        return self.nome
    
class Alimento(models.Model):
    id_alimento = models.AutoField(primary_key=True)
    classificacao = models.ForeignKey(Classificacao, on_delete=models.CASCADE)
    nome = models.CharField(max_length=255, null=False)

    def __str__(self):
        return self.nome

class Nutriente(models.Model):
    id_nutriente = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=255, null=False)
    categoria = models.CharField(max_length=255, null=True, blank=True)
    unidade = models.CharField(max_length=100, null=False)

    def __str__(self):
        return self.nome

class ComposicaoAlimento(models.Model):
    alimento = models.ForeignKey(Alimento, on_delete=models.CASCADE)
    nutriente = models.ForeignKey(Nutriente, on_delete=models.CASCADE)
    valor = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.alimento} - {self.nutriente}: {self.valor}"
       

    
