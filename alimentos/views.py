from django.shortcuts import render, get_object_or_404
from alimentos.models import Classificacao, Alimento, Nutriente, ComposicaoAlimento
from django.db.models import Q
from django.http import  JsonResponse as js
from django.core.paginator import Paginator
from django.conf import settings
from django.forms.models import model_to_dict
from decimal import Decimal, InvalidOperation

def safe_decimal(valor, default=Decimal('0')):
    try:
        # Pode vir como string, então converter para Decimal
        return Decimal(valor)
    except (InvalidOperation, TypeError):
        return default

# NUTRIENTES
def nutrientes(request):
    query = request.GET.get('query', '')
    nutrientes_lista = Nutriente.objects.filter(nome__icontains=query).order_by('-is_active', 'nome')
    paginator = Paginator(nutrientes_lista, 10)
    page_obj = paginator.get_page(request.GET.get('page'))

    return render(request, 'nutrientes.html', {
        'nutrientes': page_obj,
        'page_obj': page_obj,
        'query': query
    })

def get_nutriente(request):
    if request.method == "GET":
        id = request.GET.get("id")
        try:
            nutriente = Nutriente.objects.get(id=id)
            data = {
                "id": nutriente.id,
                "nome": nutriente.nome,
            }
            return js(data)
        except Nutriente.DoesNotExist:
            return js({"error": "Nutriente não encontrado"}, status=404)

def busca_nutriente_nome(request):
    nome = request.GET.get('nome', '')
    if nome:
        nutrientes = Nutriente.objects.filter(nome__icontains=nome)
        if nutrientes.exists():
            return js({'nutrientes': list(nutrientes.values())})
        return js({'mensagem': 'Nutriente não encontrado'})
    return js({'mensagem': 'Informe um nome para busca'}, status=400)

def inserir_nutriente(request):
    nome = request.GET.get('nome', '')
    unidade = request.GET.get('unidade', '')
    classificacao = request.GET.get('classificacao', '')
    classificacao = Classificacao.objects.get(id=classificacao)
    if nome and unidade:
        if Nutriente.objects.filter(nome__iexact=nome).exists():
            return js({'Mensagem': f'{nome} já existe'}, status=400)
        Nutriente.objects.create(nome=nome, unidade=unidade, classificacao=classificacao)
        return js({'Mensagem': f'{nome} inserido com sucesso!'}, status=200)
    return js({'Mensagem': 'Informe nome e unidade'}, status=400)

def atualizar_nutriente(request):
    id = request.GET.get('id')
    nome = request.GET.get('nome')
    unidade = request.GET.get('unidade')
    classificacao = request.GET.get('classificacao')
    classificacao = Classificacao.objects.get(id=classificacao)

    if not id or not nome or not unidade:
        return js({'Mensagem': 'Parâmetros incompletos'}, status=400)

    nutriente = get_object_or_404(Nutriente, pk=id)
    if (
        nutriente.nome == nome and
        nutriente.unidade == unidade and
        (nutriente.classificacao or '') == (classificacao or '')
    ):
        return js({'Mensagem': "Nenhum dado foi alterado!"}, status=401)

    if Nutriente.objects.exclude(id=id).filter(nome__iexact=nome).exists():
        return js({'Mensagem': 'Erro: Outro nutriente já existe com esse nome.'}, status=400)

    nutriente.nome = nome
    nutriente.unidade = unidade
    nutriente.classificacao = classificacao or None
    nutriente.save()

    return js({'Mensagem': 'Nutriente atualizado com sucesso!'}, status=200)

def ativar_nutriente(request):
    id = request.GET.get('id')
    nutriente = get_object_or_404(Nutriente, pk=id)
    nutriente.is_active = True
    nutriente.save()
    return js({'Mensagem': f'{nutriente.nome} foi ativado'}, status=200)

def desativar_nutriente(request):
    id = request.GET.get('id')
    if id:
      nutriente = get_object_or_404(Nutriente, pk=id)
      nutriente.is_active = False
      nutriente.save()
      return js({'Mensagem': f'{nutriente.nome} foi desativado'}, status=200)
    return js({'Mensagem': f'Não foi possível desativar {nutriente.nome}'}, status=400)

def listar_nutrientes(request):
    query = request.GET.get('query', '').strip()
    nutrientes = Nutriente.objects.all()

    if query:
        nutrientes = nutrientes.filter(nome__icontains=query)
    
    nutrientes = nutrientes.order_by('nome')

    paginator = Paginator(nutrientes, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'nutrientes': page_obj.object_list,
        'page_obj': page_obj,
        'query': query,
    }

# CLASSIFICAÇÃO
def classificacao(request):
    query = request.GET.get('query', '')
    classificacoes_lista = Classificacao.objects.filter(nome__icontains=query).exclude(nome__iexact="Não Classificado").order_by('-is_active', 'nome')
    paginator = Paginator(classificacoes_lista, getattr(settings, 'NUMBER_GRID_PAGES', 10))
    page_obj = paginator.get_page(request.GET.get('page'))

    return render(request, 'classificacao.html', {
        'classificacoes': page_obj,
        'page_obj': page_obj,
        'query': query
    })

def get_classificacao(request):
   return render(request, 'classificacao.html', {})

def inserir_classificacao(req):
   nome = req.GET.get('nome')
   if nome:
      if not Classificacao.objects.filter(nome__iexact=nome).exists():
         Classificacao.objects.create(nome=nome)
         return js({'Mensagem': f'{nome} inserido com sucesso!'})
      else:
         return js({'Mensagem': f'O nutriente "{nome}" já existe na base de dados!'}, status=401)
   return js({'Mensagem': f'{nome} não pode ser inserido'}, status=400)

def atualizar_classificacao(req):
    id = req.GET.get('id')
    nome = req.GET.get('nome')
    if Classificacao.objects.exclude(id=id).filter(nome__iexact=nome).exists():
        return js({'Mensagem': "Outra classificação já existe com esse nome!"}, status=401)
    if Classificacao.objects.filter(nome__iexact=nome).exists():
        return js({'Mensagem': "Nome da classificação não foi alterado!"}, status=401)

    if id:   
        item = Classificacao.objects.get(id=id)
        item.nome = nome
        item.save()
        return js({'Mensagem': 'Classificação atualizada com sucesso!'}, status=200)

    if not id or not nome:
        return js({'Mensagem': 'Parâmetros incompletos'}, status=400)

def ativar_classificacao(req):
   teste = req.GET.get('id')
   if teste:
      item = Classificacao.objects.get(id=teste)
      item.is_active = True
      item.save()
   return js({'Mensagem': f'{item.nome} foi desativado'})

def desativar_classificacao(req):
   teste = req.GET.get('id')
   if teste:
      item = Classificacao.objects.get(id=teste)
      item.is_active = False
      item.save()
   return js({'Mensagem': f'{item.nome} foi desativado'})

def listar_classificacoes(request):
    query = request.GET.get('query', '').strip()
    classificacoes = Classificacao.objects.all()

    if query:
        classificacoes = classificacoes.filter(nome__icontains=query)

    classificacoes = classificacoes.order_by('nome')

    paginator = Paginator(classificacoes, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'classificacoes': page_obj, 
        'page_obj': page_obj,
        'query': query,
    }
   
# ALIMENTOS
def alimentos(request):
    query = request.GET.get('query', '')
    alimentos_lista = Alimento.objects.filter(nome__icontains=query).order_by('-is_active', 'nome')
    paginator = Paginator(alimentos_lista, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    
    return render(request, 'alimentos.html', {
        'alimentos': page_obj,
        'page_obj': page_obj,
        'query': query
    })

def alimento_json(request):
    id = request.GET.get('id')
    try:
        alimento = Alimento.objects.get(id=id)
        alimento_dict = model_to_dict(alimento)
        return js(alimento_dict)
    except Alimento.DoesNotExist:
        return js({'error': 'Alimento não encontrado'}, status=404)
    except Exception as e:
        return js({'error': str(e)}, status=500)

def classificacoes_json(request):
    classificacoes = list(Classificacao.objects.filter(
        Q(is_active=True) | Q(nome='Não Classificado')
    ).values('id', 'nome'))
    return js(classificacoes, safe=False)

def busca_alimento_nome(request):
    nome = request.GET.get('nome', '')
    if nome:
        nutrientes = Nutriente.objects.filter(nome__icontains=nome)
        if nutrientes.exists():
            return js({'nutrientes': list(nutrientes.values())})
        return js({'mensagem': 'Nutriente não encontrado'})
    return js({'mensagem': 'Informe um nome para busca'}, status=400)

def inserir_alimento(request):
    if request.method == 'POST':
        nome = request.POST.get('nome')
        classificacao = request.POST.get('id_classificacao')
        ms = request.POST.get('ms')
        ed = request.POST.get('ed')
        pb = request.POST.get('pb')
        if not Alimento.objects.filter(nome=nome).exists():
            item = Classificacao.objects.get(id=classificacao)
            Alimento.objects.create(nome=nome, classificacao=item, ms=ms, ed=ed, pb=pb)
            return js({'Mensagem': f'"{nome}" inserido com sucesso!'}, status=200)
        return js({'Mensagem': "Alimento já existente na base de dados!"}, status=400)

def atualizar_alimento(request):
    if request.method == 'POST':
        idAlimento = int(request.POST.get('id'))
        nomeAlimento = request.POST.get('nome')
        idClass = int(request.POST.get('idClass'))
        ms = safe_decimal(request.POST.get('ms'))
        ed = safe_decimal(request.POST.get('ed'))
        pb = safe_decimal(request.POST.get('pb'))

        alimento = Alimento.objects.get(id=idAlimento)

        # Verifica se todos os dados são iguais (nome, classificação, ms, ed, pb)
        if (nomeAlimento == alimento.nome and
            idClass == alimento.classificacao.id and
            ms == alimento.ms and
            ed == alimento.ed and
            pb == alimento.pb):
            return js({'Mensagem': "Nenhum dado foi alterado!"}, status=401)#status=401 definido pra informação

        # Atualiza nome se mudou e classificação não mudou
        if (nomeAlimento != alimento.nome and idClass == alimento.classificacao.id and
            (ms == alimento.ms or ed == alimento.ed or pb == alimento.pb)):
            alimento.ms = ms
            alimento.ed = ed
            alimento.pb = pb
            nomeAntigo = alimento.nome
            alimento.nome = nomeAlimento
            alimento.save()
            return js({'Mensagem': f"{nomeAntigo} atualizado para {alimento.nome}"}, status=200)

        # Atualiza classificação se mudou e nome não mudou
        if (nomeAlimento == alimento.nome and idClass != alimento.classificacao.id and
            (ms == alimento.ms or ed == alimento.ed or pb == alimento.pb)):
            alimento.ms = ms
            alimento.ed = ed
            alimento.pb = pb
            alimento.classificacao = Classificacao.objects.get(id=idClass)
            alimento.save()
            return js({'Mensagem': f"Classificação do alimento {alimento.nome} atualizada para {alimento.classificacao.nome}"}, status=200)

        # Atualiza ms, ed e pb se algum deles mudou (mantendo nome e classificação iguais)
        if (nomeAlimento == alimento.nome and idClass == alimento.classificacao.id and
            (ms != alimento.ms or ed != alimento.ed or pb != alimento.pb)):
            alimento.ms = ms
            alimento.ed = ed
            alimento.pb = pb
            alimento.save()
            return js({'Mensagem': f"Valores gerais atualizados"}, status=200)

        # Caso nome e classificação tenham mudado, atualiza tudo junto (incluindo ms, ed e pb)
        alimento.nome = nomeAlimento
        alimento.classificacao = Classificacao.objects.get(id=idClass)
        alimento.ms = ms
        alimento.ed = ed
        alimento.pb = pb
        alimento.save()
        return js({'Mensagem': "Nome, classificação e valores nutricionais atualizados"}, status=200)

    return js({'Mensagem': 'erro'}, status=400)

def ativar_alimento(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        nome = request.POST.get('nome')
        item = Alimento.objects.get(id=id)
        if item:
            if item.is_active == False:
                item.is_active = True
                item.save()
                return js({'Mensagem': f'"{nome}" ativado com sucesso!'}, status=200)
            else:
                return js({'Mensagem': 'Esse alimento ja esta ativo!'}, status=400)
    else:
        return js({'Mensagem': 'Alguma coisa deu errado'}, status=400)
    
def desativar_alimento(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        nome = request.POST.get('nome')
        if id:
            item = Alimento.objects.get(id=id)
            if item.is_active == True:
                item.is_active = False
                item.save()
                return js({'Mensagem': f'"{nome}" desativado com sucesso!'}, status=200)
            else:
                return js({'Mensagem': 'Esse alimento ja esta desativado!'}, status=400)
    return js({'Mensagem': 'Alguma coisa deu errado'}, status=400)

def apagar_alimento(request):
    if request.GET.get('id'):
        id_alimento = request.GET.get('id')
        try:
            alimento = Alimento.objects.get(id=id_alimento)
            alimento.delete()
            return js({'alimento': 'DELETADO'})
        except Alimento.DoesNotExist:
            return js({'alimento': 'Alimento não encontrado'})
    return js({'alimento': 'Preciso de uma id'})

#COMPOSIÇÃO DE ALIMENTO
def composicaoAlimento(request):
    query = request.GET.get('query', '').strip()
    composicaoAlimento_lista = ComposicaoAlimento.objects.all()

    if query:
        composicaoAlimento_lista = composicaoAlimento_lista.filter(
            alimento__nome__icontains=query
        ) | ComposicaoAlimento.objects.filter(
            nutriente__nome__icontains=query
        )

    composicaoAlimento_lista = composicaoAlimento_lista.order_by('-alimento__is_active', 'alimento__nome')

    paginator = Paginator(composicaoAlimento_lista, 10)
    page_obj = paginator.get_page(request.GET.get('page'))

    return render(request, 'composicao_alimento.html', {
        'composicao_alimento': page_obj,
        'page_obj': page_obj,
        'query': query
    })

def composicao_json(request):
    id = request.GET.get('id')
    alimento_obj = Alimento.objects.get(id=id)
    alimento_nome = alimento_obj.nome
    composicao = ComposicaoAlimento.objects.filter(alimento_id=id).select_related('nutriente')
    composicao_dict = [
        {
            'id': comp.id,
            'alimento_id': comp.alimento_id,
            'nutriente_id': comp.nutriente.id,
            'nutriente_nome': comp.nutriente.nome,
            'valor': str(comp.valor)
        }
        for comp in composicao
    ]
    data = {
        'alimento': {'id': id,'nome': alimento_nome},
        'composicao': composicao_dict,
    }
    return js(data)

def get_composicaoAlimento(request):
    if request.method == "GET":
        id = request.GET.get("id")
        try:
            composicao = ComposicaoAlimento.objects.get(id=id)
            data = {
                "id": composicao.id,
                "alimento": composicao.alimento.nome,
                "nutriente": composicao.nutriente.nome,
                "valor": composicao.valor,
            }
            return js(data)
        except ComposicaoAlimento.DoesNotExist:
            return js({"error": "Composição de alimento não encontrada"}, status=404)

def busca_composicaoAlimento_nome(request):
    nome = request.GET.get('nome', '')
    if nome:
        composicoes = ComposicaoAlimento.objects.filter(alimento__nome__icontains=nome)
        if composicoes.exists():
            return js({'composicoes': list(composicoes.values())})
        return js({'mensagem': 'Composição de alimento não encontrada'})
    return js({'mensagem': 'Informe um nome para busca'}, status=400)

def inserir_composicaoAlimento(request):
    alimento_id = request.GET.get('alimento_id', '')
    nutriente_id = request.GET.get('nutriente_id', '')
    valor = request.GET.get('valor', '')

    if alimento_id and nutriente_id and valor:
        if ComposicaoAlimento.objects.filter(alimento_id=alimento_id, nutriente_id=nutriente_id).exists():
            return js({'Mensagem': 'Composição de alimento já existe!'}, status=400)

        ComposicaoAlimento.objects.create(
            alimento_id=alimento_id,
            nutriente_id=nutriente_id,
            valor=valor
        )

        return js({'Mensagem': 'Composição de alimento inserida com sucesso!'}, status=200)

    return js({'Mensagem': 'Informe alimento, nutriente e valor'}, status=400)

def atualizar_composicaoAlimento(request):
    id = request.GET.get('id')
    alimento_id = request.GET.get('alimento_id')
    nutriente_id = request.GET.get('nutriente_id')
    valor = request.GET.get('valor')

    if not id or not alimento_id or not nutriente_id or not valor:
        return js({'Mensagem': 'Parâmetros incompletos'}, status=400)

    composicao = get_object_or_404(ComposicaoAlimento, pk=id)

    if (str(composicao.alimento_id) == str(alimento_id) and
        str(composicao.nutriente_id) == str(nutriente_id) and
        str(composicao.valor) == str(valor)):
        return js({'Mensagem': 'Nenhuma alteração detectada.'}, status=400)

    if ComposicaoAlimento.objects.filter(
        alimento_id=alimento_id,
        nutriente_id=nutriente_id
    ).exclude(id=id).exists():
        return js({'Mensagem': 'Composição de alimento já existe!'}, status=400)

    composicao.alimento_id = alimento_id
    composicao.nutriente_id = nutriente_id
    composicao.valor = valor
    composicao.save()
    return js({'Mensagem': 'Composição de alimento atualizada com sucesso!'}, status=200)

def ativar_composicaoAlimento(request):
    id = request.GET.get('id')
    composicao = get_object_or_404(ComposicaoAlimento, pk=id)
    composicao.is_active = True
    composicao.save()
    return js({'Mensagem': f'Composição de alimento {composicao.alimento.nome} foi ativada'})

def desativar_composicaoAlimento(request):
    id = request.GET.get('id')
    if id:
      composicao = get_object_or_404(ComposicaoAlimento, pk=id)
      composicao.is_active = False
      composicao.save()
      return js({'Mensagem': f'Composição de alimento {composicao.alimento.nome} foi desativada'})
    return js({'Mensagem': f'Não foi possível desativar {composicao.alimento.nome}'}, status=400)

def listar_composicaoAlimento(request):
    query = request.GET.get('query', '').strip()
    composicoes = ComposicaoAlimento.objects.all()

    if query:
        composicoes = composicoes.filter(alimento__nome__icontains=query)

    composicoes = composicoes.order_by('alimento__nome')

    paginator = Paginator(composicoes, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    context = {
        'composicoes': page_obj.object_list,
        'page_obj': page_obj,
        'query': query,
    }

def listar_alimentos_nutrientes(request):
    alimentos = list(Alimento.objects.filter(is_active=True).values('id', 'nome'))
    nutrientes = list(Nutriente.objects.all().values('id', 'nome'))
    return js({'alimentos': alimentos, 'nutrientes': nutrientes})