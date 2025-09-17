from django.core.management.base import BaseCommand
from alimentos.models import Classificacao, Alimento, Nutriente, ComposicaoAlimento
from exigencias.models import ComposicaoExigencia
import pandas as pd
import os
from django.conf import settings
from decimal import Decimal, InvalidOperation

def tratar_decimal(valor):
    try:
        if pd.isna(valor):
            return Decimal('0')
        return Decimal(str(valor))
    except (InvalidOperation, ValueError):
        return Decimal('0')

class Command(BaseCommand):
    help = "Inserindo dados alimentares"

    def handle(self, *args, **options):
        nome_arquivo = os.path.join(settings.BASE_DIR, 'alimentos', 'formulacao.xlsm')
        nome_tabela = 'Alimentos'

        # Obtendo a leitura de nutrientes BB:BC
        # obs. criei uma nova tabela dentro de alimentos la na formulação para obter os dados dos nutrientes
        composicao_exigencia = pd.read_excel(
            nome_arquivo,
            sheet_name=nome_tabela,
            usecols="BB:BC",
            engine="openpyxl",
            nrows=34
        )
            
        self.stdout.write(self.style.SUCCESS(f"{i} alimentos adicionados com sucesso!"))
        self.stdout.write(self.style.SUCCESS(f"{a} linhas de composição alimentar adicionadas com sucesso!"))