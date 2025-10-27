from django import template
register = template.Library()

@register.filter
def dictget(d, key):
    return d.get(key, 0)