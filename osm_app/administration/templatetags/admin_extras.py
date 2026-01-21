from django import template

register = template.Library()

@register.filter(name='get_attr')
def getattr_filter(obj, attr_name):
    try:
        return getattr(obj, attr_name)
    except AttributeError:
        return ""
# Trigger Reload
