# ===================================================================
# BIBLIOTECAS
# ===================================================================
from django.core.management.base import BaseCommand
from django.db import connection
import os
from django.conf import settings
from faker import Faker
import pandas as pd
from decimal import Decimal, InvalidOperation
import random

# ===================================================================
# MODELOS
# ===================================================================

from alimentos.models import Classificacao, Alimento, Nutriente, ComposicaoAlimento
from exigencias.models import Exigencia, ComposicaoExigencia, CategoriaAnimal
from animais.models import Animal
from dietas.models import Dieta, ComposicaoDieta


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
        cursor = connection.cursor()

# ===================================================================
# LIMPANDO O BANCO DE DADOS
# ===================================================================

        app_label = ["alimentos", "exigencias", "animais"]
        tables = [
            table
            for table in connection.introspection.table_names()
            if any(app in table for app in app_label)
        ]

        if connection.vendor == "postgresql":
            for table in tables:
                cursor.execute(f'ALTER TABLE "{table}"DISABLE TRIGGER ALL')

        for table in tables:
            cursor.execute(f'TRUNCATE TABLE "{table}" RESTART IDENTITY CASCADE')

        if connection.vendor == "postgresql":
            for table in tables:
                cursor.execute(
                    f"""
                    SELECT setval(pg_get_serial_sequence('"{table}"', 'id'), 1, false)
                        WHERE EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = '"{table}"' AND column_name = 'id'
                        AND column_default LIKE 'nextval%'
                    );
                """
                )

        if connection.vendor == "postgresql":
            for table in tables:
                cursor.execute(f'ALTER TABLE "{table}" ENABLE TRIGGER ALL;')

        self.stdout.write(self.style.WARNING("Banco de dados limpo com sucesso!"))
        
# ===================================================================
# INSERINDO DADOS DE NUTRIENTES, ALIMENTOS E COMPOSICOES-NUTRICIONAIS
# ===================================================================

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

# ===================================================================
# INSERINDO DADOS DE ANIMAIS
# ===================================================================
   
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
            'default1.png', 'default2.png', 'default3.png',
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
        
# ==========================================================================
# INSERINDO DADOS DE EXIGENCIAS E SUAS COMPOSIÇÕES NUTRICIONAIS DA EXIGENCIA
# ==========================================================================

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

# ===================================================================
# INSEIRNDO DADOS DE DIETAS E COMPOSIÇÕES NUTRICIONAIS DA DIETA
# ===================================================================      

        # lista de nomes de dietas reais de cavalos
        nomes_dietas = {
            'Dieta Feno Premium': 'Baseada em feno de alta qualidade e grãos energéticos.',
            'Dieta Power Equus': 'Alta em proteína e energia para cavalos atletas.',
            'Dieta de Manutenção Leve': 'Para cavalos em repouso ou com baixa atividade física.',
            'Dieta de Engorda Controlada': 'Foco em ganho de peso gradual com alta digestibilidade.',
            'Dieta de Reabilitação Digestiva': 'Baixo amido, rica em fibras para recuperação intestinal.',
            'Dieta Equilíbrio Total': 'Balanceada para manutenção de peso e vitalidade.',
            'Dieta de Corrida Intensiva': 'Alta em energia e gorduras boas para performance.',
            'Dieta Verde Natural': 'Com base em pasto fresco e suplementos minerais.',
            'Dieta Elite Equestre': 'Composta por grãos nobres e suplementos vitamínicos.',
            'Dieta de Crescimento Jovem': 'Rica em proteínas e cálcio para desenvolvimento.',
            'Dieta de Reposição Pós-Treino': 'Reposição rápida de energia e eletrólitos.',
            'Dieta Senior Plus': 'Fibras suaves e baixa caloria para cavalos idosos.',
            'Dieta de Gestação Equina': 'Enriquecida com cálcio, fósforo e vitaminas A e E.',
            'Dieta de Lactação Equina': 'Alta em energia e proteína para suporte à produção de leite.',
            'Dieta Natural Balance': 'Equilíbrio entre fibras, proteínas e minerais naturais.'
        }

        exigencias = list(Exigencia.objects.all())
        alimentos = list(Alimento.objects.all())

        if not exigencias:
            self.stdout.write(self.style.ERROR("Nenhuma exigência encontrada!"))
            return
        if not alimentos:
            self.stdout.write(self.style.ERROR("Nenhum alimento encontrado!"))
            return

        dietas_criadas = []

        animais = Animal.objects.all()
        # cria 15 dietas
        for i, (nome, descricao) in enumerate(nomes_dietas.items()):
            exigencia_escolhida = random.choice(exigencias)
            dieta = Dieta.objects.create(
                nome=nome,
                descricao=descricao,
                exigencia=exigencia_escolhida,
                animal=animais[i]
            )
            dietas_criadas.append(dieta)

        # cria composições aleatórias para cada dieta
        for dieta in dietas_criadas:
            qtd_componentes = random.randint(3, 6)  # cada dieta com 3 a 6 alimentos
            alimentos_escolhidos = random.sample(alimentos, qtd_componentes)

            for alimento in alimentos_escolhidos:
                quantidade = round(random.uniform(0.5, 4.0), 1)  # de 0.5 a 4.0 kg
                ComposicaoDieta.objects.create(
                    quantidade=quantidade,
                    dieta=dieta,
                    alimento=alimento
                )

        self.stdout.write(self.style.SUCCESS(f"{len(dietas_criadas)} dietas e composições criadas com sucesso!"))