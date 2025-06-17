from django.core.management.base import BaseCommand
from alimentos.models import Classificacao, Alimento, Nutriente
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
      dados_excel1 = pd.read_excel(
         nome_arquivo,
         sheet_name=nome_tabela,
         usecols="BB:BC",
         engine="openpyxl",
         nrows=34
      )

      # Percorrendo o dataframe dados_excel1
      for i, nutriente in enumerate(dados_excel1.iloc[:,0].dropna()):
         nome = str(nutriente).strip()# convertendo o nome para uma string sem espacos
         unidade = str(dados_excel1.iloc[i,1]).strip()# a mesma coisa do nome, porem pegando o dado da segunda coluna na posicao i do dataframe
         Nutriente.objects.create(nome=nome, unidade=unidade)#adicionando o nutriente e sua respectiva unidade
      self.stdout.write(self.style.SUCCESS(f"{i} nutrientes adicionados com sucesso"))
      
      # Obtendo a leitura das colunas E:D 
      dados_excel2 = pd.read_excel( # Lendo Nome de Alimento e Classificacao
         nome_arquivo,
         sheet_name=nome_tabela,
         usecols="D:E, G:I",
         engine='openpyxl',
         nrows=146
      )
      # Percorrendo o dataframe 
      aux = 0 
      for i, nome in enumerate(dados_excel2.iloc[:,0].dropna()):
         classificacao = str(dados_excel2.iloc[i,1]).strip()
         ms = tratar_decimal(dados_excel2.iloc[i,2])
         ed = tratar_decimal(dados_excel2.iloc[i,3])
         pb = tratar_decimal(dados_excel2.iloc[i,4])
         nome = str(nome).strip()
         
         if not Classificacao.objects.filter(nome=classificacao).exists():
            Classificacao.objects.create(nome=classificacao)# criando uma classificação caso ela não exista
            aux+=1

         classificacao_obj = Classificacao.objects.get(nome=classificacao)

         Alimento.objects.create(nome=nome, classificacao=classificacao_obj, pb=pb, ms=ms, ed=ed)
      self.stdout.write(self.style.SUCCESS(f"{aux} categorias adicionadas com sucesso"))
      self.stdout.write(self.style.SUCCESS(f"{i} alimentos adicionados com sucesso"))