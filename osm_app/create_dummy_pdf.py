
import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'osm_app.settings')
django.setup()

from annotator.models import UploadedPDF
from django.contrib.auth.models import User
from django.core.files.base import ContentFile

def create_dummy_pdf():
    try:
        user = User.objects.get(username='demo_evaluator')
    except User.DoesNotExist:
        print("Demo user not found.")
        return

    # Check if exists
    if UploadedPDF.objects.filter(id=99999).exists():
        print("Dummy PDF 99999 already exists.")
        return

    # Create dummy pdf
    dummy_pdf = UploadedPDF(
        id=99999,
        user=user,
        original_name="Demo Evaluation Sheet",
        decrypted=True
    )
    # Save a dummy file content
    dummy_pdf.file.save('demo_dummy.pdf', ContentFile(b'dummy pdf content'))
    dummy_pdf.save()
    
    # Ensure ID is 99999 (if save didn't respect it, though usually manual ID works if not auto-field collision, 
    # but AutoField might override. Safest is to force it if needed, but Django default lets you set ID if not None)
    
    if dummy_pdf.id != 99999:
        # If it didn't take the ID, update it using raw sql or update
        print(f"Created with ID {dummy_pdf.id}, attempting to force 99999")
        UploadedPDF.objects.filter(id=dummy_pdf.id).update(id=99999)
        
    print("Dummy PDF 99999 created successfully.")

if __name__ == "__main__":
    create_dummy_pdf()
