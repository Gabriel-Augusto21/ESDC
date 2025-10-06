from django.db import models
from django.core.validators import FileExtensionValidator
import os


class animais(models.Model):
    nome = models.CharField(max_length=30)
    foto = models.ImageField(upload_to="fotos_perfil/",
                                    validators=[FileExtensionValidator(allowed_extensions=["jpg", "png", "jpeg"])],
                                    null=True,
                                    blank=True,
                                    default=None)
    
    def delete_imagem(self, *args, **kwargs):
        # Deleta o arquivo físico
        if self.imagem and os.path.isfile(self.imagem.path):
            os.remove(self.imagem.path)