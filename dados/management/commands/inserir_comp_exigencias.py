from django.core.management.base import BaseCommand
from exigencias.models import Exigencia, ComposicaoExigencia, CategoriaAnimal
from alimentos.models import Nutriente
import pandas as pd
import os
from django.conf import settings
from dados.management.commands.inserir_dados import tratar_decimal


class Command(BaseCommand):
    help = "Inserindo dados de Exigência + Composição"

    def handle(self, *args, **options):
        caminho_arquivo = os.path.join(settings.BASE_DIR, 'alimentos', 'formulacao.xlsm')
        nome_tabela = 'ExigenciaLeitura'
        nrows = 138

        dados_exigencia = pd.read_excel(
            caminho_arquivo,
            sheet_name=nome_tabela,
            usecols="A:C",
            engine="openpyxl",
            nrows=nrows
        )

        dados_categoria = pd.read_excel(
            caminho_arquivo,
            sheet_name=nome_tabela,
            usecols="D:G",
            engine="openpyxl",
            nrows=nrows
        )

        dados_composicao = pd.read_excel(
            caminho_arquivo,
            sheet_name=nome_tabela,
            usecols="H:AI",
            engine="openpyxl",
            nrows=nrows
        )

        for i, primeira_col in enumerate(dados_exigencia.iloc[:, 0]):
            if i == 0:
                continue

            # categoria animal
            cols_categoria = dados_categoria.iloc[i]
            peso_vivo = tratar_decimal(cols_categoria.iloc[0])
            fase = int(cols_categoria.iloc[1]) if pd.notna(cols_categoria.iloc[1]) else 25
            esforco = cols_categoria.iloc[2] if pd.notna(cols_categoria.iloc[2]) else "Sem Esforço"
            gmd = tratar_decimal(cols_categoria.iloc[3])
            categoria_obj = CategoriaAnimal.objects.create(
                peso_vivo=peso_vivo,
                fase=fase,
                esforco=esforco,
                gmd=gmd
            )

            # exigência
            cols_exigencia = dados_exigencia.iloc[i]
            nome = primeira_col
            ed = tratar_decimal(cols_exigencia.iloc[1])
            pb = tratar_decimal(cols_exigencia.iloc[2])
            exigencia_obj = Exigencia.objects.create(
                nome=nome,
                ed=ed,
                pb=pb,
                categoria=categoria_obj
            )

            # composição da exigência
            cols_composicao = dados_composicao.iloc[i]
            for j, valor in enumerate(cols_composicao):
                if pd.isna(valor):
                    continue
                try:
                    nutriente = Nutriente.objects.all()[j]
                    ComposicaoExigencia.objects.create(
                        exigencia=exigencia_obj,
                        nutriente=nutriente,
                        valor=tratar_decimal(valor),
                        is_active=True
                    )
                except IndexError:
                    self.stdout.write(
                        self.style.WARNING(f"Nutriência {j} não encontrada para exigência {nome}")
                    )

        self.stdout.write(self.style.SUCCESS(f"{i} exigências, categorias e composições adicionadas com sucesso"))
