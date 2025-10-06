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
            "categoria_fase": exigencia.categoria.fase,
            "categoria_esforco": exigencia.categoria.esforco,
            "categoria_peso_vivo": float(exigencia.categoria.peso_vivo or 0),
            "categoria_descricao": exigencia.categoria.descricao_fase_esforco
        }
        return js(data)
    except Exigencia.DoesNotExist:
        return js({"error": "Exigência não encontrada"}, status=404)
        
def get_categorias(request):
    try:
        categorias = CategoriaAnimal.objects.filter(is_active=True).order_by('fase', 'esforco')
        data = [
            {
            "id": cat.id,
            "fase": cat.fase,
            "esforco": cat.esforco,
            "descricao": cat.descricao_fase_esforco,
            "peso_vivo": float(cat.peso_vivo or 0)
            }
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

def _get_or_create_or_update_categoria(fase, esforco, peso_vivo=None):
    if fase is None or esforco is None:
        raise ValueError('Fase (meses) e esforço são necessários')
    try:
        fase_val = int(fase)
    except Exception:
        raise ValueError('Fase (meses) inválida')

    peso_vivo_dec = None
    if peso_vivo is not None and peso_vivo != '':
        try:
            peso_vivo_dec = Decimal(str(peso_vivo))
        except (InvalidOperation, TypeError):
            raise ValueError('Peso vivo inválido')

    from django.db import IntegrityError

    try:
        categoria, created = CategoriaAnimal.objects.get_or_create(
            fase=fase_val,
            esforco=esforco,
            defaults={
                'peso_vivo': peso_vivo_dec if peso_vivo_dec is not None else Decimal('0.00'),
                'gmd': Decimal('0.00'),
                'is_active': True
            }
        )
    except IntegrityError:
        qs = CategoriaAnimal.objects.filter(fase=fase_val, esforco=esforco)
        if qs.exists():
            categoria = qs.first()
            created = False
        else:
            raise ValueError('Erro ao obter/criar categoria')

    updated = False
    if not created and peso_vivo_dec is not None:
        try:
            current = categoria.peso_vivo or Decimal('0.00')
        except Exception:
            current = Decimal('0.00')
        if current != peso_vivo_dec:
            categoria.peso_vivo = peso_vivo_dec
            categoria.save(update_fields=['peso_vivo'])
            updated = True

    return categoria, created, updated

def inserir_exigencia(request):
    if request.method != "POST":
        return js({'Mensagem': 'Método não permitido'}, status=405)

    nome = request.POST.get('nome', '').strip()
    categoria_id = request.POST.get('categoria')  
    fase = request.POST.get('fase')               
    esforco = request.POST.get('esforco')        
    peso_vivo = request.POST.get('peso_vivo')  

    try:
        pb = Decimal(request.POST.get('pb', 0) or 0)
        ed = Decimal(request.POST.get('ed', 0) or 0)
    except (TypeError, InvalidOperation):
        return js({'Mensagem': 'PB ou ED inválidos'}, status=400)

    if not nome:
        return js({'Mensagem': 'Nome é obrigatório'}, status=400)

    categoria = None
    created_categoria = False
    updated_categoria = False

    if categoria_id:
        try:
            categoria = CategoriaAnimal.objects.get(id=categoria_id)
        except CategoriaAnimal.DoesNotExist:
            return js({'Mensagem': 'Categoria inválida'}, status=400)
    else:
        if fase is None or esforco is None:
            return js({'Mensagem': 'Informe categoria (id) ou fase (meses) e esforço'}, status=400)
        try:
            categoria, created_categoria, updated_categoria = _get_or_create_or_update_categoria(fase, esforco, peso_vivo)
        except ValueError as e:
            return js({'Mensagem': str(e)}, status=400)

    if Exigencia.objects.filter(nome__iexact=nome, categoria=categoria).exists():
        return js({'Mensagem': f'{nome} já existe para esta categoria'}, status=400)

    Exigencia.objects.create(
        nome=nome,
        categoria=categoria,
        pb=pb,
        ed=ed
    )

    mensagem = f'{nome} inserido com sucesso!'
    return js({'Mensagem': mensagem}, status=200)

def atualizar_exigencia(request):
    if request.method != "POST":
        return js({'Mensagem': 'Método não permitido'}, status=405)
    id = request.POST.get('id')
    nome = request.POST.get('nome', '').strip()
    categoria_id = request.POST.get('categoria')  
    fase = request.POST.get('fase')               
    esforco = request.POST.get('esforco')       
    peso_vivo = request.POST.get('peso_vivo')    

    try:
        pb = Decimal(request.POST.get('pb', 0) or 0)
        ed = Decimal(request.POST.get('ed', 0) or 0)
    except (TypeError, InvalidOperation):
        return js({'Mensagem': 'PB ou ED inválidos'}, status=400)

    if not id or not nome:
        return js({'Mensagem': 'Parâmetros incompletos'}, status=400)

    exigencia = get_object_or_404(Exigencia, pk=id)

    categoria = None
    created_categoria = False
    updated_categoria = False

    if categoria_id:
        try:
            categoria = CategoriaAnimal.objects.get(id=categoria_id)
            if peso_vivo is not None and peso_vivo != '':
                try:
                    peso_vivo_dec = Decimal(str(peso_vivo))
                    if categoria.peso_vivo != peso_vivo_dec:
                        categoria.peso_vivo = peso_vivo_dec
                        categoria.save(update_fields=['peso_vivo'])
                        updated_categoria = True
                except (InvalidOperation, TypeError):
                    return js({'Mensagem': 'Peso vivo inválido'}, status=400)
        except CategoriaAnimal.DoesNotExist:
            return js({'Mensagem': 'Categoria inválida'}, status=400)
    else:
        if fase is None or esforco is None:
            return js({'Mensagem': 'Informe categoria (id) ou fase (meses) e esforço'}, status=400)
        try:
            categoria, created_categoria, updated_categoria = _get_or_create_or_update_categoria(fase, esforco, peso_vivo)
        except ValueError as e:
            return js({'Mensagem': str(e)}, status=400)

    if Exigencia.objects.exclude(id=id).filter(nome__iexact=nome, categoria=categoria).exists():
        return js({'Mensagem': 'Já existe outra exigência com esse nome para essa categoria.'}, status=400)

    exigencia.nome = nome
    exigencia.pb = pb
    exigencia.ed = ed
    exigencia.categoria = categoria
    exigencia.save()

    mensagem = 'Exigência atualizada com sucesso!'
    return js({'Mensagem': mensagem}, status=200)

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

#COMPOSIÇÃO DE EXIGÊNCIAS
def composicaoExigencia(request):
    query = request.GET.get('query', '').strip()
    lista_composicao_exigencia = ComposicaoExigencia.objects.all()

    if query:
        lista_composicao_exigencia = lista_composicao_exigencia.filter(
            exigencia__nome__icontains=query
        ) | ComposicaoExigencia.objects.filter(
            nutriente__nome__icontains=query
        )

    lista_composicao_exigencia = lista_composicao_exigencia.order_by('-exigencia__is_active', 'exigencia__nome')

    paginator = Paginator(lista_composicao_exigencia, 10)
    page_obj = paginator.get_page(request.GET.get('page'))

    return render(request, 'composicao_exigencia.html', {
        'composicao_exigencia': page_obj,
        'page_obj': page_obj,
        'query': query
    })

def composicao_exigencia_json(request):
    id = request.GET.get('id')
    try:
        exigencia_obj = Exigencia.objects.get(id=id)
    except Exigencia.DoesNotExist:
        return js({'Mensagem': 'Exigência não encontrada'}, status=404)

    composicao = ComposicaoExigencia.objects.filter(exigencia_id=id).order_by('nutriente__nome').select_related('nutriente')
    composicao_dict = [
        {
            'id': comp.id,
            'is_active': comp.is_active,
            'exigencia_id': comp.exigencia_id,
            'nutriente_id': comp.nutriente.id,
            'nutriente_nome': comp.nutriente.nome,
            'nutriente_unidade': getattr(comp.nutriente, 'unidade', ''),
            'valor': str(comp.valor)
        }
        for comp in composicao
    ]
    data = {
        'exigencia': {'id': id, 'nome': exigencia_obj.nome},
        'composicao': composicao_dict,
    }
    return js(data)

def nutrientes_disponiveis_json(request):
    id = request.GET.get('id_composicao')
    nutrientes_relacionados = ComposicaoExigencia.objects.filter(
        exigencia_id=id
    ).values_list('nutriente_id', flat=True)
    nutrientes_disponiveis = Nutriente.objects.exclude(id__in=nutrientes_relacionados).filter(is_active=True)
    return js({'response': list(nutrientes_disponiveis.values('id', 'nome'))})

def get_composicaoExigencia(request):
    id = request.GET.get("id")
    try:
        composicao = ComposicaoExigencia.objects.select_related('exigencia', 'nutriente').get(id=id)
        data = {
            "id": composicao.id,
            "valor": str(composicao.valor),
            "exigencia_id": composicao.exigencia_id,
            "exigencia_nome": composicao.exigencia.nome,
            "nutriente_id": composicao.nutriente_id,
            "nutriente_nome": composicao.nutriente.nome,
            "is_active": composicao.is_active,
        }
        return js(data)
    except ComposicaoExigencia.DoesNotExist:
        return js({"error": "Composição de exigência não encontrada"}, status=404)

def busca_composicaoExigencia_nome(request):
    nome = request.GET.get('nome', '')
    if nome:
        composicoes = ComposicaoExigencia.objects.filter(exigencia__nome__icontains=nome)
        if composicoes.exists():
            return js({'composicoes': list(composicoes.values())})
        return js({'mensagem': 'Composição de exigência não encontrada'})
    return js({'mensagem': 'Informe um nome para busca'}, status=400)

def inserir_composicao_exigencia(request):
    if request.method == 'POST':
        exigencia_id = request.POST.get('exigencia_id') or request.POST.get('id_exigencia')
        nutriente_id = request.POST.get('nutriente_id') or request.POST.get('id_nutriente')
        valor = request.POST.get('valor') or request.POST.get('quantidade')
    else:
        exigencia_id = request.GET.get('exigencia_id') or request.GET.get('id_exigencia')
        nutriente_id = request.GET.get('nutriente_id') or request.GET.get('id_nutriente')
        valor = request.GET.get('valor') or request.GET.get('quantidade')

    if not (exigencia_id and nutriente_id and valor):
        return js({'Mensagem': 'Informe exigência, nutriente e valor'}, status=400)
    try:
        valor_dec = Decimal(str(valor))
    except (InvalidOperation, TypeError):
        return js({'Mensagem': 'Valor inválido'}, status=400)

    if ComposicaoExigencia.objects.filter(exigencia_id=exigencia_id, nutriente_id=nutriente_id).exists():
        return js({'Mensagem': 'Composição de exigência já existe!'}, status=400)

    composicao_obj = ComposicaoExigencia.objects.create(
        exigencia_id=exigencia_id,
        nutriente_id=nutriente_id,
        valor=valor_dec
    )

    exigencia_obj = Exigencia.objects.get(id=exigencia_id)
    composicao = ComposicaoExigencia.objects.filter(exigencia_id=exigencia_id, nutriente__is_active=True).order_by('-id').select_related('nutriente')
    composicao_dict = [
        {
            'id': comp.id,
            'is_active': comp.is_active,
            'exigencia_id': comp.exigencia_id,
            'nutriente_id': comp.nutriente.id,
            'nutriente_nome': comp.nutriente.nome,
            'nutriente_unidade': getattr(comp.nutriente, 'unidade', ''),
            'valor': str(comp.valor)
        }
        for comp in composicao
    ]
    data = {
        'exigencia': {'id': exigencia_id,'nome': exigencia_obj.nome},
        'composicao': composicao_dict,
    }
    return js({'Mensagem': 'Nutriente inserido na composição com sucesso!', 'data': data}, status=201)

def atualizar_composicaoExigencia(request):
    id = request.POST.get('id') if request.method == 'POST' else request.GET.get('id')
    valor = request.POST.get('valor') if request.method == 'POST' else request.GET.get('valor')

    if not id or not valor:
        return js({'Mensagem': 'Parâmetros incompletos'}, status=400)

    composicao = get_object_or_404(ComposicaoExigencia, pk=id)

    try:
        valor_dec = Decimal(str(valor))
    except (InvalidOperation, TypeError):
        return js({'Mensagem': 'Valor inválido'}, status=400)

    if str(composicao.valor) == str(valor_dec):
        return js({'Mensagem': 'Nenhuma alteração detectada.'}, status=400)

    composicao.valor = valor_dec
    composicao.save()

    return js({'Mensagem': 'Valor atualizado com sucesso!'}, status=200)


def ativar_composicaoExigencia(request):
    id = request.POST.get('id') if request.method == 'POST' else request.GET.get('id')
    if not id:
        return js({'Mensagem': 'Parâmetro "id" ausente'}, status=400)
    try:
        composicao = ComposicaoExigencia.objects.get(id=id)
        composicao.is_active = True
        composicao.save()
        exigencia_obj = Exigencia.objects.get(id=composicao.exigencia.id)
        composicao_qs = ComposicaoExigencia.objects.filter(exigencia_id=composicao.exigencia.id).order_by('nutriente__nome').select_related('nutriente')
        composicao_dict = [
            {
                'id': comp.id,
                'is_active': comp.is_active,
                'exigencia_id': comp.exigencia_id,
                'nutriente_id': comp.nutriente.id,
                'nutriente_nome': comp.nutriente.nome,
                'nutriente_unidade': getattr(comp.nutriente, 'unidade', ''),
                'valor': str(comp.valor)
            }
            for comp in composicao_qs
        ]
        data = {
            'exigencia': {'id': exigencia_obj.id,'nome': exigencia_obj.nome},
            'composicao': composicao_dict,
        }
        return js({'Mensagem': 'Composição de exigência foi ativada', 'data': data}, status=202)
    except ComposicaoExigencia.DoesNotExist:
        return js({'Mensagem': 'Composição não encontrada'}, status=404)


def desativar_composicaoExigencia(request):
    id = request.POST.get('id') if request.method == 'POST' else request.GET.get('id')
    if not id:
        return js({'Mensagem': 'Parâmetro "id" ausente'}, status=400)
    try:
        composicao = ComposicaoExigencia.objects.get(id=id)
        composicao.is_active = False
        composicao.save()
        exigencia_obj = Exigencia.objects.get(id=composicao.exigencia.id)
        composicao_qs = ComposicaoExigencia.objects.filter(exigencia_id=composicao.exigencia.id).order_by('nutriente__nome').select_related('nutriente')
        composicao_dict = [
            {
                'id': comp.id,
                'is_active': comp.is_active,
                'exigencia_id': comp.exigencia_id,
                'nutriente_id': comp.nutriente.id,
                'nutriente_nome': comp.nutriente.nome,
                'nutriente_unidade': getattr(comp.nutriente, 'unidade', ''),
                'valor': str(comp.valor)
            }
            for comp in composicao_qs
        ]
        data = {
            'exigencia': {'id': exigencia_obj.id,'nome': exigencia_obj.nome},
            'composicao': composicao_dict,
        }
        return js({'Mensagem': 'Composição de exigência foi desativada', 'data': data}, status=202)
    except ComposicaoExigencia.DoesNotExist:
        return js({'Mensagem': 'Composição não encontrada'}, status=404)

def listar_composicaoExigencia(request):
    query = request.GET.get('query', '').strip()
    composicoes = ComposicaoExigencia.objects.all()

    if query:
        composicoes = composicoes.filter(exigencia__nome__icontains=query)

    composicoes = composicoes.order_by('exigencia__nome')

    paginator = Paginator(composicoes, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, 'composicao_exigencia.html', {
        'composicao_exigencia': page_obj,
        'page_obj': page_obj,
        'query': query,
    })

def listar_exigencias_nutrientes(request):
    exigencias = list(Exigencia.objects.filter(is_active=True).values('id', 'nome').order_by('nome'))
    nutrientes = list(Nutriente.objects.filter(is_active=True).values('id', 'nome').order_by('nome'))
    return js({'exigencias': exigencias, 'nutrientes': nutrientes})