from django.db import models
from decimal import Decimal

class Dieta(models.Model):
    nome = models.CharField(max_length=50)
    descricao = models.CharField(max_length=250)
    especifica = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    exigencia = models.ForeignKey('exigencias.Exigencia', on_delete=models.CASCADE)

    def total_nutrientes_vetor(self):
        """
        Retorna um vetor (lista) com o total de cada nutriente fornecido pela dieta.
        O vetor terá formato:
        [
            {"nutriente": "PB", "total": 120.5, "unidade": "%"},
            {"nutriente": "MS", "total": 500.0, "unidade": "g"},
            ...
        ]
        """
        totais = {}
        for comp in self.composicaodieta_set.all():
            for ca in comp.alimento.composicaoalimento_set.all():
                key = ca.nutriente.nome
                if key not in totais:
                    totais[key] = {
                        "nutriente": ca.nutriente.nome,
                        "total": Decimal(0),
                        "unidade": ca.nutriente.unidade
                    }
                totais[key]["total"] += Decimal(ca.valor) * Decimal(comp.quantidade)
        
        # convertendo em lista de dicionários
        return list(totais.values())

class ComposicaoDieta(models.Model):
    dieta = models.ForeignKey(Dieta, on_delete=models.CASCADE)
    alimento = models.ForeignKey('alimentos.Alimento', on_delete=models.CASCADE)
    quantidade = models.DecimalField(max_digits=15, decimal_places=9, default=0.0)

    def __str__(self):
        return f"{self.dieta.nome} - {self.alimento.nome}: {self.quantidade}"
