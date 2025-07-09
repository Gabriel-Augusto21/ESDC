from django.core.management.base import BaseCommand
from exigencias.models import Exigencia, ComposicaoExigencia, CategoriaAnimal
import pandas as pd
import os
from django.conf import settings
from dados.management.commands.inserir_dados import tratar_decimal

class Command(BaseCommand):
    help = "Inserindo dados de Exigência"

    def handle(self, *args, **options):
        caminho_arquivo = os.path.join(settings.BASE_DIR, 'alimentos', 'formulacao.xlsm')
        nome_tabela = 'ExigenciaLeitura'
        nrows = 138

        # Obtendo a leitura de nutrientes BB:BC
        # obs. criei uma nova tabela dentro de alimentos la na formulação para obter os dados dos nutrientes
        dados_exigencia = pd.read_excel(
            caminho_arquivo,
            sheet_name=nome_tabela,
            usecols="A:C",
            engine="openpyxl",
            nrows=nrows
        )

        dados_composicao_exigencia = pd.read_excel(
            caminho_arquivo,
            sheet_name=nome_tabela,
            usecols="D:G",
            engine="openpyxl",
            nrows=nrows
        )

        for i, primeira_col in enumerate(dados_exigencia.iloc[:,0]):
            if i == 0: continue
            cols_composicao = dados_composicao_exigencia.iloc[i]
            peso_vivo = tratar_decimal(cols_composicao.iloc[0])
            fase = int(cols_composicao.iloc[1]) if pd.notna(cols_composicao.iloc[1]) else 25
            esforco = cols_composicao.iloc[2] if pd.notna(cols_composicao.iloc[2]) else "Sem Esforço"
            gmd = tratar_decimal(cols_composicao.iloc[3])
            obj_atual = CategoriaAnimal.objects.create(peso_vivo=peso_vivo, fase=fase, esforco=esforco, gmd=gmd)
        
            cols_exigencia = dados_exigencia.iloc[i]
            nome = primeira_col
            ed = tratar_decimal(cols_exigencia.iloc[1])
            pb = tratar_decimal(cols_exigencia.iloc[2])

            Exigencia.objects.create(nome=nome, ed=ed, pb=pb, categoria=obj_atual)

        self.stdout.write(self.style.SUCCESS(f"{i} exigências/categoria_exigencia adicionados com sucesso"))
        