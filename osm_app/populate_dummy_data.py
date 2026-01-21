
import os
import django
import shutil
from datetime import datetime

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "osm_app.settings")
django.setup()

from django.contrib.auth.models import User, Group
from administration.models import QuestionPaper, Question, PDFAssignment, Allocation
from annotator.models import UploadedPDF
from django.core.files import File

def create_dummy_data():
    print("Creating Groups...")
    student_group, _ = Group.objects.get_or_create(name='Student')
    faculty_group, _ = Group.objects.get_or_create(name='Faculty')

    print("Creating Users...")
    # Faculty
    faculty, _ = User.objects.get_or_create(username='faculty_demo', defaults={'email': 'fac@test.com'})
    faculty.set_password('pass123')
    faculty.groups.add(faculty_group)
    faculty.save()

    # Students
    s1, _ = User.objects.get_or_create(username='student_alpha', defaults={'email': 's1@test.com'})
    s1.set_password('pass123')
    s1.groups.add(student_group)
    s1.is_active = True # Will be set by assignment logic usually, but force true for demo
    s1.save()

    s2, _ = User.objects.get_or_create(username='student_beta', defaults={'email': 's2@test.com'})
    s2.set_password('pass123')
    s2.groups.add(student_group)
    s2.save()

    print("Creating Question Paper...")
    paper, _ = QuestionPaper.objects.get_or_create(name='Mathematics Final 2024', total_marks=50)
    
    if paper.questions.count() == 0:
        Question.objects.create(paper=paper, question_no='Q1', text='Solve 2x + 5 = 15', max_marks=10, co='CO1', bl='L2')
        Question.objects.create(paper=paper, question_no='Q2', text='Define Calculus.', max_marks=20, co='CO2', bl='L1')
        Question.objects.create(paper=paper, question_no='Q3', text='What is a Matrix?', max_marks=20, co='CO1', bl='L1')

    print("Uploading Dummy PDF...")
    # Ensure we have a dummy file to use
    dummy_pdf_path = 'dummy_sheet.pdf' 
    # Create a minimal valid PDF if not exists (using reportlab if available, else just a text file renamed)
    # Ideally checking if we have one in media already.
    # We will try to find *any* pdf in media/pdfs to reuse, or create a placeholder.
    
    # Let's just mock the DB entry pointing to a file we hope exists or creates newly
    # For robust script, we'd generate a PDF, but for now we assume the user might have one or we create a text file as pdf (might break viewer but good for DB test)
    
    # ACTUALLY, let's just use a fake path if we don't have a real file, or try to use an existing one.
    pdf_obj = UploadedPDF.objects.last()
    if not pdf_obj:
        print("No existing PDF found to clone. Skipping PDF assignment for now (upload one via UI first).")
    else:
        print(f"Using existing PDF: {pdf_obj.original_name}")
        
        # Link PDF + Paper -> Student 1
        assign, created = PDFAssignment.objects.get_or_create(
            student=s1,
            defaults={
                'pdf': pdf_obj,
                'question_paper': paper,
                'is_active': True
            }
        )
        if not created:
            assign.question_paper = paper
            assign.save()
            print("Updated Student 1 Assignment with Paper.")
        else:
            print("Assigned PDF & Paper to Student 1.")

        # Allocate Student 1 -> Faculty
        alloc, created = Allocation.objects.get_or_create(
            faculty=faculty,
            student=s1,
            defaults={'status': 'PENDING', 'batch': 'Batch A'}
        )
        print(f"Allocated {s1.username} to {faculty.username}")

    print("Done! Login as 'faculty_demo' / 'pass123' to test.")

if __name__ == '__main__':
    create_dummy_data()
