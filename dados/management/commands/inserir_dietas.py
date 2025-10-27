from django.core.management.base import BaseCommand
from dietas.models import Dieta, ComposicaoDieta
from exigencias.models import Exigencia
from alimentos.models import Alimento

class Command(BaseCommand):
    help = "Inserindo dados alimentares"

    def handle(self, *args, **options):
        # pegando exigencias existentes
        exigencias = Exigencia.objects.all()
            
        Dieta.objects.create(
            nome = 'Dieta Feno Premium',
            descricao = 'Dieta teste 1 criada e vinculada a exigencia com id 1',
            exigencia = exigencias[0]
        )
        Dieta.objects.create(
            nome = 'Dieta Power Equus',
            descricao = 'Dieta teste 2 criada e vinculada a exigencia com id 2',
            exigencia = exigencias[1]
        )
        
        # pegando alimentos e exigencias existentes
        alimentos = Alimento.objects.all()
        dietas = Dieta.objects.all()
        
        # coposicoes relacionadas a dieta 1 
        ComposicaoDieta.objects.create(
            quantidade= 2,
            dieta = dietas[0],
            alimento = alimentos[0]
        )
        ComposicaoDieta.objects.create(
            quantidade= 1.8,
            dieta = dietas[0],
            alimento = alimentos[1]
        )
        ComposicaoDieta.objects.create(
            quantidade= 1.5,
            dieta = dietas[0],
            alimento = alimentos[2]
        )
        
        # coposicoes relacionadas ao alimento 2
        ComposicaoDieta.objects.create(
            quantidade= 2.5,
            dieta = dietas[1],
            alimento = alimentos[3]
        )
        ComposicaoDieta.objects.create(
            quantidade= 3,
            dieta = dietas[1],
            alimento = alimentos[4]
        )
        ComposicaoDieta.objects.create(
            quantidade= 3,
            dieta = dietas[1],
            alimento = alimentos[5]
        )
        ComposicaoDieta.objects.create(
            quantidade= 3,
            dieta = dietas[1],
            alimento = alimentos[6]
        )
        
        self.stdout.write(self.style.SUCCESS("Dietas e composições de teste adicionadas com sucesso!"))