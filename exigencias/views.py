from django.shortcuts import render, get_object_or_404
from exigencias.models import CategoriaAnimal, Exigencia, ComposicaoExigencia
from alimentos.models import Nutriente
from django.http import HttpResponse,JsonResponse as js
from django.core.paginator import Paginator
import json
from decimal import Decimal, InvalidOperation

#EXIGÊNCIAS
def gerar_select_categorias():
    categorias = CategoriaAnimal.objects.filter(is_active=True)
    return ''.join(
        f'<option value="{c.id}">{c.descricao_fase_esforco}</option>'
        for c in categorias
    )

def exigencias(request):
    query = request.GET.get('query', '')
    exigencia_lista = Exigencia.objects.select_related('categoria').filter(
        nome__icontains=query
    ).order_by('-is_active', 'nome', 'categoria__peso_vivo')
    paginator = Paginator(exigencia_lista, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    
    return render(request, 'exigencias.html', {
        'exigencias': page_obj,
        'page_obj': page_obj,
        'query': query,
    })

def get_exigencia(request):
    id = request.GET.get("id")
    try:
        exigencia = Exigencia.objects.select_related('categoria').get(id=id)
        data = {
            "id": exigencia.id,
            "nome": exigencia.nome,
            "pb": float(exigencia.pb),
            "ed": float(exigencia.ed),
            "categoria_id": exigencia.categoria.id,
            "categoria_descricao": exigencia.categoria.descricao_fase_esforco
        }
        return js(data)
    except Exigencia.DoesNotExist:
        return js({"error": "Exigência não encontrada"}, status=404)
    
def get_categorias(request):
    try:
        categorias = CategoriaAnimal.objects.filter(is_active=True)
        data = [
            {"id": cat.id, "descricao": cat.descricao_fase_esforco}
            for cat in categorias
        ]
        return js(data, safe=False)
    except Exception as e:
        return js({'erro': str(e)}, status=500)

def busca_exigencia_nome(request):
    nome = request.GET.get('nome', '')
    if nome:
        exigencias = Exigencia.objects.filter(nome__icontains=nome)
        if exigencias.exists():
            return js({'exigencias': list(exigencias.values())})
        return js({'mensagem': 'Exigência não encontrada'})
    return js({'mensagem': 'Informe um nome para busca'}, status=400)

def inserir_exigencia(request):
    if request.method != "POST":
        return js({'Mensagem': 'Método não permitido'}, status=405)

    nome = request.POST.get('nome', '').strip()
    categoria_id = request.POST.get('categoria')
    try:
        pb = Decimal(request.POST.get('pb', 0))
        ed = Decimal(request.POST.get('ed', 0))
    except (TypeError, InvalidOperation):
        return js({'Mensagem': 'PB ou ED inválidos'}, status=400)

    if not nome or not categoria_id:
        return js({'Mensagem': 'Nome e categoria são obrigatórios'}, status=400)

    if Exigencia.objects.filter(nome__iexact=nome, categoria_id=categoria_id).exists():
        return js({'Mensagem': f'{nome} já existe para esta categoria'}, status=400)

    try:
        categoria = CategoriaAnimal.objects.get(id=categoria_id)
    except CategoriaAnimal.DoesNotExist:
        return js({'Mensagem': 'Categoria inválida'}, status=400)

    Exigencia.objects.create(
        nome=nome,
        categoria=categoria,
        pb=pb,
        ed=ed
    )

    return js({'Mensagem': f'{nome} inserido com sucesso!'}, status=200)

def atualizar_exigencia(request):
    if request.method != "POST":
        return js({'Mensagem': 'Método não permitido'}, status=405)
    id = request.POST.get('id')
    nome = request.POST.get('nome', '').strip()
    categoria_id = request.POST.get('categoria')

    try:
        pb = Decimal(request.POST.get('pb', 0))
        ed = Decimal(request.POST.get('ed', 0))
    except (TypeError, InvalidOperation):
        return js({'Mensagem': 'PB ou ED inválidos'}, status=400)

    if not id or not nome or not categoria_id:
        return js({'Mensagem': 'Parâmetros incompletos'}, status=400)

    exigencia = get_object_or_404(Exigencia, pk=id)

    if Exigencia.objects.exclude(id=id).filter(nome__iexact=nome, categoria_id=categoria_id).exists():
        return js({'Mensagem': 'Já existe outra exigência com esse nome para essa categoria.'}, status=400)

    exigencia.nome = nome
    exigencia.pb = pb
    exigencia.ed = ed
    exigencia.categoria_id = categoria_id
    exigencia.save()

    return js({'Mensagem': 'Exigência atualizada com sucesso!'}, status=200)

def desativar_exigencia(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        try:
            exigencia = Exigencia.objects.get(id=id)
            exigencia.is_active = False
            exigencia.save()
            return js({'Mensagem': f'Exigência "{exigencia.nome}" desativada com sucesso!'}, status=200)
        except Exigencia.DoesNotExist:
            return js({'Mensagem': 'Exigência não encontrada'}, status=404)
    return js({'Mensagem': 'Método não permitido'}, status=405)

def ativar_exigencia(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        try:
            exigencia = Exigencia.objects.get(id=id)
            exigencia.is_active = True
            exigencia.save()
            return js({'Mensagem': f'Exigência "{exigencia.nome}" ativada com sucesso!'}, status=200)
        except Exigencia.DoesNotExist:
            return js({'Mensagem': 'Exigência não encontrada'}, status=404)
    return js({'Mensagem': 'Método não permitido'}, status=405)

def listar_composicoes_exigencia(request):
    exigencia_id = request.GET.get('exigencia_id')
    try:
        exigencia = Exigencia.objects.get(id=exigencia_id)
        composicoes = ComposicaoExigencia.objects.filter(exigencia=exigencia)
        data = [{
            "nutriente": comp.nutriente.nome,
            "valor": float(comp.valor)
        } for comp in composicoes]
        return js({'composicoes': data})
    except Exigencia.DoesNotExist:
        return js({'Mensagem': 'Exigência não encontrada'}, status=404)
    
def composicao_exigencias(request):
    nutrientes = Nutriente.objects.filter(is_active=True).order_by('nome')
    return render(request, 'composicao_exigencia.html', {
        'nutrientes': nutrientes,
    })
