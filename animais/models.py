from django.db import models
from django.core.validators import FileExtensionValidator
import os
from dietas.models import Dieta

class Animal(models.Model):
    nome = models.CharField(max_length=30)

    imagem = models.ImageField(
        upload_to="fotos_animais/",
        validators=[FileExtensionValidator(allowed_extensions=["jpg", "png", "jpeg"])],
        null=True,
        blank=True,
        default="default.jpg"  
    )

    proprietario = models.CharField(max_length=100)
    peso_vivo = models.DecimalField(max_digits=6, decimal_places=2)
    data_nasc = models.DateField()
    genero = models.CharField(max_length=1, choices=[('M', 'Macho'), ('F', 'Fêmea')])
    is_active = models.BooleanField(default=True)

    def delete_imagem(self, *args, **kwargs):
        if self.imagem and os.path.isfile(self.imagem.path) and self.imagem.name != "default.jpg":
            os.remove(self.imagem.path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.nome
