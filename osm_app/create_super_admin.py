
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "osm_app.settings")
django.setup()

from django.contrib.auth.models import User

username = 'admin'
password = 'admin123'
email = 'admin@example.com'

try:
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print(f"Successfully updated existing user '{username}'.")
    else:
        User.objects.create_superuser(username, email, password)
        print(f"Successfully created new superuser '{username}'.")

    print(f"Username: {username}")
    print(f"Password: {password}")

except Exception as e:
    print(f"Error: {e}")
