import os
import django
from django.urls import get_resolver
from django.urls.resolvers import URLPattern, URLResolver

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def get_urls(patterns, prefix=''):
    urls = []
    for pattern in patterns:
        if isinstance(pattern, URLPattern):
            # Extract pattern string from regex/route
            if hasattr(pattern.pattern, '_route'):
                route = pattern.pattern._route
            else:
                route = str(pattern.pattern)
            
            full_path = prefix + route
            name = pattern.name or ''
            
            # View class or function
            view = pattern.callback
            view_name = f"{view.__module__}.{view.__name__}" if hasattr(view, '__name__') else str(view)
            
            urls.append({'path': full_path, 'name': name, 'view': view_name})
        elif isinstance(pattern, URLResolver):
            if hasattr(pattern.pattern, '_route'):
                route = pattern.pattern._route
            else:
                route = str(pattern.pattern)
            
            urls.extend(get_urls(pattern.url_patterns, prefix + route))
    return urls

all_urls = get_urls(get_resolver().url_patterns)

print("API ENDPOINTS")
print("-" * 80)
for u in sorted(all_urls, key=lambda x: x['path']):
    if u['path'].startswith('api/'):
        print(f"Path: /{u['path']}")
        print(f"Name: {u['name']}")
        print(f"View: {u['view']}")
        print("-" * 40)
