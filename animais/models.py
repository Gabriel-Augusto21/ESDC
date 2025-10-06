from django.db import models
from django.core.validators import FileExtensionValidator
import os

class Animal(models.Model):
    nome = models.CharField(max_length=30)

    imagem = models.ImageField(
        upload_to="fotos_perfil/",
        validators=[FileExtensionValidator(allowed_extensions=["jpg", "png", "jpeg"])],
        null=True,
        blank=True,
        default="fotos_perfil/default.jpg"  # imagem padrão
    )

    proprietario = models.CharField(max_length=100)
    peso_vivo = models.DecimalField(max_digits=6, decimal_places=2)
    data_nasc = models.DateField()
    genero = models.CharField(max_length=1, choices=[('M', 'Macho'), ('F', 'Fêmea')])
    is_active = models.BooleanField(default=True)
    id_dieta = models.IntegerField(null=True, blank=True)

    def delete_imagem(self, *args, **kwargs):
        if self.imagem and os.path.isfile(self.imagem.path) and self.imagem.name != "fotos_perfil/default.jpg":
            os.remove(self.imagem.path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.nome
