import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'osm_app.settings')
django.setup()

from django.contrib.auth.models import User

# Get or create superuser
try:
    user = User.objects.get(username='admin')
    print(f"Found existing user: {user.username}")
except User.DoesNotExist:
    user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print(f"Created new superuser: {user.username}")

# Set password
user.set_password('admin123')
user.save()

print(f"\nSuperadmin credentials:")
print(f"Username: {user.username}")
print(f"Password: admin123")
print(f"\nYou can now login at http://127.0.0.1:8000/")
