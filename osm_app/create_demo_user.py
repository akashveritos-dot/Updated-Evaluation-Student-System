import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'osm_app.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth.models import Group

def create_demo_user():
    username = 'demo_evaluator'
    password = 'demo_password_123'
    
    if User.objects.filter(username=username).exists():
        print(f"User '{username}' already exists.")
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()
        print(f"Password updated for '{username}'.")
    else:
        user = User.objects.create_user(username=username, password=password)
        print(f"User '{username}' created.")
        
    # Add to Faculty group if exists
    try:
        faculty_group = Group.objects.get(name='Faculty')
        user.groups.add(faculty_group)
        print(f"User '{username}' added to 'Faculty' group.")
    except Group.DoesNotExist:
        print("Group 'Faculty' does not exist. Please create it first.")

if __name__ == '__main__':
    create_demo_user()
