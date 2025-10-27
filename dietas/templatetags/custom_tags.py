from django import template
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