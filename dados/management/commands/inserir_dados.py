from django.core.management.base import BaseCommand
from alimentos.models import Classificacao, Alimento, Nutriente, ComposicaoAlimento
from animais.models import Animal
from faker import Faker
import pandas as pd
import os
from django.conf import settings
from decimal import Decimal, InvalidOperation
import random

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

        classificacao_padrao = Classificacao.objects.create(nome="Não Classificado", is_active=False)
        contador_classificacao = 1 # contador de classificacoes
        # Percorrendo o dataframe dados_excel1
        for i, nutriente in enumerate(dados_excel1.iloc[:,0].dropna()):
            nome = str(nutriente).strip()# convertendo o nome para uma string sem espacos
            unidade = str(dados_excel1.iloc[i,1]).strip()# a mesma coisa do nome, porem pegando o dado da segunda coluna na posicao i do dataframe
            Nutriente.objects.create(nome=nome, unidade=unidade, classificacao_id=classificacao_padrao.id)#adicionando o nutriente e sua respectiva unidade
        self.stdout.write(self.style.SUCCESS(f"{i} nutrientes adicionados com sucesso"))
        
        # Obtendo a leitura das colunas E:D 
        dados_excel2 = pd.read_excel( # Lendo Nome de Alimento e Classificacao
            nome_arquivo,
            sheet_name=nome_tabela,
            usecols="D:E, G:I",
            engine='openpyxl',
            nrows=146
        )

        caminho_arquivo = os.path.join(settings.BASE_DIR, 'alimentos', 'formulacao.xlsm')
        nome_planilha = "Alimentos"

        dataframe_composicao = pd.read_excel(
            caminho_arquivo,
            sheet_name=nome_planilha,
            usecols="J:AP",
            engine="openpyxl"
        )
        # Quantidade de linhas de composição
        a = 0
        # Percorrendo o dataframe 
        for i, nome in enumerate(dados_excel2.iloc[:,0].dropna()):
            classificacao = str(dados_excel2.iloc[i,1]).strip()
            ms = tratar_decimal(dados_excel2.iloc[i,2])
            ed = tratar_decimal(dados_excel2.iloc[i,3])
            pb = tratar_decimal(dados_excel2.iloc[i,4])
            nome = str(nome).strip()
            
            if not Classificacao.objects.filter(nome=classificacao).exists():
                Classificacao.objects.create(nome=classificacao)# criando uma classificação caso ela não exista
                contador_classificacao+=1

            classificacao_obj = Classificacao.objects.get(nome=classificacao)

            courrent_obj = Alimento.objects.create(nome=nome, classificacao=classificacao_obj, pb=pb, ms=ms, ed=ed)
            for j in range(dataframe_composicao.shape[1]):
                valor = tratar_decimal(dataframe_composicao.iloc[i, j])
                if valor > 0:
                    try:
                        courrent_nutriente = Nutriente.objects.get(id=j + 1)  # ajuste se IDs começam em 1
                        ComposicaoAlimento.objects.create(
                            valor=valor,
                            alimento=courrent_obj,
                            nutriente=courrent_nutriente
                        )
                        a += 1
                    except Nutriente.DoesNotExist:
                        print(f"Nutriente com ID={j + 1} não encontrado")
        
        self.stdout.write(self.style.SUCCESS(f"{contador_classificacao} categorias adicionadas com sucesso!"))
        self.stdout.write(self.style.SUCCESS(f"{i} alimentos adicionados com sucesso!"))
        self.stdout.write(self.style.SUCCESS(f"{a} linhas de composição alimentar adicionadas com sucesso!"))
        
        fake = Faker('pt_BR')
        cont_animais = 0
        
        nomes_cavalos_machos = [
            "Orgulho do Cantagallo",
            "Selvagem de Mairi",
            "Luar do Malboro",
            "Mafioso Marrecas do Cavaleiro",
            "Noturno da Diesel",
            "Galante do Expoente",
            "Dominador da Santa Esmeralda",
            "Tigre das Minas Gerais",
            "Ouro Fino da Morada Nova",
            "Maroto da Mandassaia"
        ]

        nomes_cavalos_femeas = [
            "Emblema da Figueira",
            "Guardião da Figueira",
            "Estrela do Cantagallo",
            "Lua da Morada Nova",
            "Aurora do Expoente",
            "Flor da Gameleira",
            "Esperança da Pedra Verde",
            "Diamante da Santa Esmeralda",
            "Sereia da Mandassaia",
            "Fumaça da Serra"
        ]

        nomes_imagem = [
            'default.jpg', 'default1.png', 'default2.png', 'default3.png',
            'default4.png', 'default5.png', 'default6.png', 'default7.png'
        ]

        # Cria animais machos
        for nome in nomes_cavalos_machos:
            cont_animais += 1
            Animal.objects.create(
                nome=nome,
                imagem=random.choice(nomes_imagem),
                proprietario=f"{fake.first_name()} {fake.last_name()}",
                peso_vivo=random.randint(100, 700),
                data_nasc=fake.date_between(start_date='-10y', end_date='today'),
                genero='M'
            )

        # Cria animais fêmeas
        for nome in nomes_cavalos_femeas:
            cont_animais += 1
            Animal.objects.create(
                nome=nome,
                imagem=random.choice(nomes_imagem),
                proprietario=f"{fake.first_name()} {fake.last_name()}",
                peso_vivo=random.randint(100, 700),
                data_nasc=fake.date_between(start_date='-10y', end_date='today'),
                genero='F'
            )

        self.stdout.write(self.style.SUCCESS(f"{cont_animais} animais adicionados com sucesso!"))