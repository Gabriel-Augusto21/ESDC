from django import template
from django.utils.safestring import mark_safe

register = template.Library()

@register.filter
def dictget(d, key):
    """Acessa um valor dentro de um dicionário com segurança."""
    if isinstance(d, dict):
        return d.get(key, '')
    # se for uma lista, tenta pegar o primeiro elemento (para segurança)
    if isinstance(d, list) and len(d) > 0 and isinstance(d[0], dict):
        return d[0].get(key, '')
    return ''

@register.filter
def truncar(value, decimal_places=2):
    try:
        value = float(value)
        factor = 10 ** decimal_places
        return int(value * factor) / factor
    except (ValueError, TypeError):
        return value
    
@register.filter
def to_dot_decimal(value):
    """Converte valor para formato com ponto decimal (para inputs type='number')."""
    if value is None:
        return "0"
    try:
        # Converte para string, substitui vírgula por ponto
        valor_str = str(value).replace(',', '.')
        # Converte para float e depois para string com ponto
        numero = float(valor_str)
        # Retorna como STRING para evitar formatação do Django
        return mark_safe(str(numero))
    except (ValueError, TypeError):
        return "0"