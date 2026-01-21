from urllib.parse import unquote
from users.menus import get_menu_items  # ✅ import the function

def breadcrumb(request):
    path = request.path.strip('/').split('/')
    breadcrumb = []
    url = ''

    for part in path:
        url += f'/{part}'
        name = get_menu_label(url) or part.replace('-', ' ').capitalize()
        breadcrumb.append({'name': unquote(name), 'url': url})

    return {'breadcrumb': breadcrumb}  # ✅ return as dict

def get_menu_label(url_path):
    for item in get_menu_items():  # ✅ call the function here
        if item['url'].rstrip('/') == url_path.rstrip('/'):
            return item['label']
    return None