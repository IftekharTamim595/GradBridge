#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
from pathlib import Path
import os
import sys

BASE_DIR = Path(__file__).resolve().parent

try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / ".env")
except ImportError:
    pass

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    # Debug: Print settings
    try:
        from django.conf import settings
        import django
        django.setup()
        print(f"DEBUG: REST_USE_JWT = {getattr(settings, 'REST_USE_JWT', 'Not Set')}")
        print(f"DEBUG: JWT_AUTH_COOKIE = {getattr(settings, 'JWT_AUTH_COOKIE', 'Not Set')}")
        print(f"DEBUG: SimpleJWT Installed = {'rest_framework_simplejwt' in settings.INSTALLED_APPS}")
    except Exception as e:
        print(f"DEBUG Error: {e}")

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
