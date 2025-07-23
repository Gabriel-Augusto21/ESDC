from django import template

register = template.Library()

@register.filter
def truncar(value, decimal_places=2):
    try:
        value = float(value)
        factor = 10 ** decimal_places
        return int(value * factor) / factor
    except (ValueError, TypeError):
        return value