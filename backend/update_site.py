import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.sites.models import Site

print("Updating site configuration...")
try:
    site = Site.objects.get(id=settings.SITE_ID)
    print(f"Old Site: {site.domain} - {site.name}")
    site.domain = 'localhost:3000'
    site.name = 'GradBridge'
    site.save()
    print(f"New Site: {site.domain} - {site.name}")
except Site.DoesNotExist:
    print(f"Creating new Site with ID={settings.SITE_ID}")
    Site.objects.create(id=settings.SITE_ID, domain='localhost:3000', name='GradBridge')

print("Site configuration updated.")
