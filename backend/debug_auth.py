import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

print("checking site configuration...")
try:
    site = Site.objects.get(id=settings.SITE_ID)
    print(f"Current Site (ID={settings.SITE_ID}): {site.domain} - {site.name}")
except Site.DoesNotExist:
    print(f"Site with ID={settings.SITE_ID} does not exist!")

print("\nChecking SocialApp configuration...")
apps = SocialApp.objects.all()
if apps.exists():
    print(f"Found {apps.count()} SocialApp(s) in database:")
    for app in apps:
        print(f" - Provider: {app.provider}, Name: {app.name}, Client ID: {app.client_id}, Sites: {[s.id for s in app.sites.all()]}")
else:
    print("No SocialApps found in database. Relying on settings.py configuration.")

from allauth.socialaccount import providers
from allauth.socialaccount.providers.google.provider import GoogleProvider

print("\nChecking Provider Configuration...")
registry = providers.registry
if registry.loaded:
    print("Provider registry loaded.")
    google_provider = registry.by_id(GoogleProvider.id)
    print(f"Google Provider: {google_provider.id}")
    print(f"App config from settings: {google_provider.get_app(None)}")
else:
    print("Provider registry not loaded.")
