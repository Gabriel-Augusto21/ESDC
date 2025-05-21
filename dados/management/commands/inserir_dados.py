from django.core.management.base import BaseCommand
from alimentos.models import Classificacao

class Command(BaseCommand):
    help = "Inserindo dados"

    def handle(self, *args, **options):
         nome = 'class1'
         classificacao = Classificacao(nome=nome)
         classificacao.save()

         self.stdout.write(self.style.SUCCESS(f"Classificação: {nome} adicionado com sucesso"))
