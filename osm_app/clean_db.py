
import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "osm_app.settings")
django.setup()

from django.contrib.auth.models import User, Group
from administration.models import QuestionPaper, Question, PDFAssignment, Allocation
from annotator.models import UploadedPDF, PageAnnotation

def clean_database():
    print("Starting Database Cleanup...")

    # 1. Clean Annotations and PDFs (Cascades to PDFAssignment)
    print("Deleting PageAnnotations...")
    PageAnnotation.objects.all().delete()
    
    print("Deleting UploadedPDFs (and Assignments)...")
    UploadedPDF.objects.all().delete()

    # 2. Clean Question Papers (Cascades to Questions)
    print("Deleting QuestionPapers...")
    QuestionPaper.objects.all().delete()

    # 3. Clean Allocations
    print("Deleting Allocations...")
    Allocation.objects.all().delete()

    # 4. Clean Users
    print("Cleaning Users...")
    users_to_keep = ['faculty_demo', 'student_alpha']
    
    # Get superusers
    superusers = User.objects.filter(is_superuser=True)
    superuser_ids = list(superusers.values_list('id', flat=True))
    print(f"Preserving {len(superusers)} superuser(s): {[u.username for u in superusers]}")

    import collections
    from django.db import connection

    # Delete other users using raw SQL to bypass Django's cascade check on missing tables
    print(f"Deleting non-essential users...")
    
    # 1. Identify IDs to keeping
    keep_ids = list(superusers.values_list('id', flat=True))
    
    # 2. Find IDs to delete
    users_to_delete = User.objects.exclude(id__in=keep_ids).exclude(username__in=users_to_keep)
    delete_ids = list(users_to_delete.values_list('id', flat=True))
    
    if delete_ids:
        print(f"Deleting {len(delete_ids)} users via raw SQL to bypass missing table errors.")
        with connection.cursor() as cursor:
            # Convert list to string for SQL IN clause
            ids_str = ','.join(map(str, delete_ids))
            cursor.execute(f"DELETE FROM auth_user_groups WHERE user_id IN ({ids_str})")
            cursor.execute(f"DELETE FROM auth_user_user_permissions WHERE user_id IN ({ids_str})")
            cursor.execute(f"DELETE FROM auth_user WHERE id IN ({ids_str})")
        print("Users deleted.")
    else:
        print("No users to delete.")

    # 5. Ensure Demo Users Exist
    print("Ensuring demo users exist...")
    
    # Groups
    faculty_group, _ = Group.objects.get_or_create(name='Faculty')
    student_group, _ = Group.objects.get_or_create(name='Student')

    # Faculty Demo
    if not User.objects.filter(username='faculty_demo').exists():
        print("Re-creating 'faculty_demo'...")
        f = User.objects.create_user(username='faculty_demo', email='fac@test.com', password='pass123')
        f.groups.add(faculty_group)
        f.save()
    else:
        print("'faculty_demo' already exists.")

    # Student Demo
    if not User.objects.filter(username='student_alpha').exists():
        print("Re-creating 'student_alpha'...")
        s = User.objects.create_user(username='student_alpha', email='s1@test.com', password='pass123')
        s.groups.add(student_group)
        s.save()
    else:
        print("'student_alpha' already exists.")

    print("------------------------------------------------")
    print("DATABASE CLEANUP COMPLETE")
    print("Remaining Users:")
    for u in User.objects.all():
        print(f"- {u.username} ({'Superuser' if u.is_superuser else 'User'})")

if __name__ == '__main__':
    clean_database()
