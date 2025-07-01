from django.db import models

# Create your models here.
class CategoriaAnimal(models.Model):
    fase = models.CharField(max_length=255, null=True, blank=True)
    esforco = models.CharField(max_length=255, null=True, blank=True)
    peso_vivo = models.DecimalField(max_digits=5, decimal_places=2)
    gmd = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Categoria: {self.fase or ''} {self.esforco or ''} ({self.peso_vivo}kg)"
    
    @property
    def descricao_fase_esforco(self):
        return f"{self.fase or ''} {self.esforco or ''}".strip()

class Exigencia(models.Model):
    categoria = models.ForeignKey(CategoriaAnimal, on_delete=models.CASCADE)
    nome = models.CharField(max_length=255, null=False)
    pb = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    ed = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nome} ({self.categoria})"

class ComposicaoExigencia(models.Model):
    exigencia = models.ForeignKey(Exigencia, on_delete=models.CASCADE)
    nutriente = models.ForeignKey('alimentos.Nutriente', on_delete=models.CASCADE)
    valor = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.exigencia} - {self.nutriente}: {self.valor}"
