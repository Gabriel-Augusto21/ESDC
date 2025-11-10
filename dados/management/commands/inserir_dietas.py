from django.core.management.base import BaseCommand
from dietas.models import Dieta, ComposicaoDieta
from exigencias.models import Exigencia
from alimentos.models import Alimento
import random

class Command(BaseCommand):
    help = "Insere 15 dietas realistas e composições aleatórias"

    def handle(self, *args, **options):
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

        # cria 15 dietas
        for i, (nome, descricao) in enumerate(nomes_dietas.items()):
            exigencia_escolhida = random.choice(exigencias)
            dieta = Dieta.objects.create(
                nome=nome,
                descricao=descricao,
                exigencia=exigencia_escolhida
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
