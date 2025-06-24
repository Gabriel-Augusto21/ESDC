from django.core.management.base import BaseCommand
import pandas as pd
import os
from django.conf import settings

class Command(BaseCommand):
   help = "Inserindo dados alimentares"

   def handle(self, *args, **options):

    nome_arquivo = os.path.join(settings.BASE_DIR, 'alimentos', 'formulacao.xlsm')
    nome_tabela = 'Alimentos'

    dados = pd.read_excel(
        nome_arquivo,
        sheet_name = nome_tabela,
        usecols = 'D:E, G:I',
        engine = 'openpyxl',
        nrows = 144
    )
    
    for i, nome in enumerate(dados.iloc[:,0].dropna().unique()):
        print("NOME: ", nome,"MS: ", dados.iloc[i,2], "ED: ", dados.iloc[i,3], "PB: ", dados.iloc[i,4])
        
