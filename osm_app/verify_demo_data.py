import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'osm_app.settings')
django.setup()

from faculty.models import SavedMarksheet, MarksSummary
from django.contrib.auth.models import User

def verify_data():
    print("--- Verifying Demo Data ---")
    
    # Check for demo user
    try:
        demo_user = User.objects.get(username='demo_evaluator')
        print(f"Found user: {demo_user.username}")
    except User.DoesNotExist:
        print("User 'demo_evaluator' not found!")
        return

    # Check SavedMarksheet
    sheets = SavedMarksheet.objects.filter(user=demo_user).order_by('-created_at')
    print(f"\nTotal Saved Marksheets: {sheets.count()}")
    
    if sheets.exists():
        latest = sheets.first()
        print(f"Latest Marksheet: ID={latest.id}, Created={latest.created_at}")
    else:
        print("No marksheets found for demo_evaluator.")
    
    print("\n------------------------------")

    # Check PageAnnotation
    from annotator.models import PageAnnotation
    anns = PageAnnotation.objects.filter(user=demo_user)
    print(f"\nTotal PageAnnotations: {anns.count()}")
    for a in anns[:3]:
        print(f"- PDF ID: {a.pdf_id}, Page: {a.page_number}, Actions: {len(a.actions)}")
        
    # Check UploadedPDF 99999
    from annotator.models import UploadedPDF
    if UploadedPDF.objects.filter(id=99999).exists():
        print("UploadedPDF 99999 EXISTS.")
    else:
        print("UploadedPDF 99999 DOES NOT EXIST.")

if __name__ == "__main__":
    verify_data()
