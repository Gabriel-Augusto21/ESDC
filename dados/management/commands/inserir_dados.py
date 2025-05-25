from django.core.management.base import BaseCommand
from alimentos.models import Classificacao, Alimento
import pandas as pd
import os
from django.conf import settings


class Command(BaseCommand):
   help = "Inserindo dados"

   def handle(self, *args, **options):
      nome_arquivo = os.path.join(settings.BASE_DIR, 'alimentos', 'formulacao.xlsm')
      nome_tabela = 'Alimentos'
      # Obtendo a leitura das colunas E:D 
      dados_excel2 = pd.read_excel(
         nome_arquivo,
         sheet_name=nome_tabela,
         usecols="D:E",
         engine='openpyxl',
         nrows=145
      )
      #Estou trabalhando com DATAFRAMES
      for i, nome in enumerate(dados_excel2.iloc[:,0].dropna().unique()):
         classificacao = str(dados_excel2.iloc[i,1]).strip()
         nome = str(nome).strip()
         
         if not Classificacao.objects.filter(nome=classificacao).exists():
            Classificacao.objects.create(nome=classificacao)

         classificacao_obj = Classificacao.objects.get(nome=classificacao)

         Alimento.objects.create(nome=nome, classificacao=classificacao_obj)
         self.stdout.write(self.style.SUCCESS(f"{nome}' que pertence a classificacao {classificacao_obj.nome} adicionado com sucesso"))
