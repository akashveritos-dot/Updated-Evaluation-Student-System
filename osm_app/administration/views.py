from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User, Group
from django.contrib import messages
from .models import Allocation, PDFAssignment
from annotator.models import UploadedPDF

def is_superuser(user):
    return user.is_superuser

# Helper for Logging
def log_admin_action(user, description, request):
    from faculty.models import ActionLog
    from django.utils import timezone
    
    # Get IP Address
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
        
    ActionLog.objects.create(
        user=user,
        action_description=description,
        ip_address=ip,
        timestamp=timezone.now()
    )

def extract_questions_from_file(question_paper):
    """
    Extract questions from uploaded PDF/DOC file.
    Returns number of questions extracted.
    """
    import re
    from .id_utils import generate_question_id
    from .models import Question
    
    try:
        file_path = question_paper.file.path
        text = ""
        
        # Extract text based on file type
        if file_path.lower().endswith('.pdf'):
            try:
                import PyPDF2
                with open(file_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
            except:
                return 0
        elif file_path.lower().endswith(('.doc', '.docx')):
            try:
                import docx
                doc = docx.Document(file_path)
                text = "\n".join([para.text for para in doc.paragraphs])
            except:
                return 0
        else:
            return 0
        
        # Pattern matching for questions
        # Matches: "Q1.", "Q1)", "Question 1:", "1.", "1)"
        patterns = [
            r'(?:Q|Question)\s*(\d+)[\.\):\s]+(.*?)(?=(?:Q|Question)\s*\d+|$)',
            r'^(\d+)[\.\)]\s+(.*?)(?=^\d+[\.\)]|$)'
        ]
        
        questions_found = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE | re.DOTALL)
            if matches:
                questions_found = matches
                break
        
        # Create Question objects
        count = 0
        for idx, match in enumerate(questions_found[:20]):  # Limit to 20 questions
            if len(match) >= 2:
                q_num = match[0]
                q_text = match[1].strip()[:500]  # Limit text length
                
                if q_text:  # Only add if there's actual text
                    index_number = int(q_num) if q_num.isdigit() else idx + 1
                    question_id = generate_question_id(question_paper.paper_id, index_number)
                    
                    # Ensure uniqueness
                    while Question.objects.filter(question_id=question_id).exists():
                        index_number += 100
                        question_id = generate_question_id(question_paper.paper_id, index_number)
                    
                    Question.objects.create(
                        question_id=question_id,
                        paper=question_paper,
                        index_number=index_number,
                        description=q_text,
                        max_marks=0  # Default, can be edited later
                    )
                    count += 1
        
        return count
    except Exception as e:
        print(f"Error extracting questions: {e}")
        return 0

@login_required
@user_passes_test(is_superuser)
def admin_dashboard(request):
    """
    Super Admin Dashboard
    """
    try:
        from django.utils import timezone
        from datetime import timedelta
        
        # Statistics
        total_students = User.objects.filter(groups__name='Student').count()
        total_faculty = User.objects.filter(groups__name='Faculty').count()
        pending_allocations = Allocation.objects.filter(status='PENDING').count()
        
        # "Online" Users (Login in last 30 mins)
        time_threshold = timezone.now() - timedelta(minutes=30)
        online_users_count = User.objects.filter(last_login__gte=time_threshold).count()
        online_users = User.objects.filter(last_login__gte=time_threshold).order_by('-last_login')[:5]
        
        context = {
            'total_students': total_students,
            'total_faculty': total_faculty,
            'pending_allocations': pending_allocations,
            'online_users_count': online_users_count,
            'online_users': online_users,
        }
        return render(request, 'administration/dashboard.html', context)
    except Exception as e:
        import traceback
        traceback.print_exc()
        messages.error(request, f"Dashboard error: {str(e)}")
        # Return a simple error page or redirect
        return render(request, 'administration/dashboard.html', {
            'total_students': 0,
            'total_faculty': 0,
            'pending_allocations': 0,
            'online_users_count': 0,
            'online_users': [],
            'error': str(e)
        })

@login_required
@user_passes_test(is_superuser)
def user_management(request):
    """
    List and Manage Users
    """
    users = User.objects.all().order_by('-date_joined')
    groups = Group.objects.all()
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'add_user':
            username = request.POST.get('username')
            email = request.POST.get('email')
            password = request.POST.get('password')
            group_id = request.POST.get('group')
            
            if User.objects.filter(username=username).exists():
                messages.error(request, 'Username already exists')
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                if group_id:
                    group = Group.objects.get(id=group_id)
                    user.groups.add(group)
                
                log_admin_action(request.user, f"Created user: {username}", request)
                messages.success(request, f'User {username} created successfully')
                
        elif action == 'delete_user':
            user_id = request.POST.get('user_id')
            try:
                user_to_delete = User.objects.get(id=user_id)
                username = user_to_delete.username
                user_to_delete.delete()
                log_admin_action(request.user, f"Deleted user: {username}", request)
                messages.success(request, 'User deleted successfully')
            except User.DoesNotExist:
                messages.error(request, 'User not found')
            
    context = {
        'users': users,
        'groups': groups
    }
    return render(request, 'administration/users_list.html', context)

@login_required
@user_passes_test(is_superuser)
def pdf_management(request):
    """
    Unified PDF Management: Upload -> Assign Student -> Select Paper (All-in-One)
    """
    students = User.objects.filter(groups__name='Student')
    pdfs = UploadedPDF.objects.all().order_by('-uploaded_at')
    assignments = PDFAssignment.objects.all().select_related('student', 'pdf', 'question_paper').order_by('-assigned_at')
    
    from annotator.forms import UploadPDFForm
    from django.core.files.storage import FileSystemStorage
    from annotator.utils import extract_images_from_pdf
    from .models import QuestionPaper
    
    papers = QuestionPaper.objects.all().order_by('-created_at')
    import os
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'upload_and_assign':
            form = UploadPDFForm(request.POST, request.FILES)
            student_id = request.POST.get('student')
            paper_id = request.POST.get('paper')
            
            if form.is_valid():
                uploaded_file = request.FILES['file']
                password = form.cleaned_data.get('password')
                
                # 1. Save PDF
                fs = FileSystemStorage(location='media/pdfs')
                filename = fs.save(uploaded_file.name, uploaded_file)
                
                pdf = UploadedPDF.objects.create(
                    user=request.user, 
                    file=f'pdfs/{filename}',
                    original_name=uploaded_file.name,
                    decrypted=False
                )
                
                log_admin_action(request.user, f"Uploaded PDF: {uploaded_file.name}", request)
                
                # 2. Process PDF (Extract Images)
                try:
                    output_dir = f'media/pdf_images/pdf_{pdf.id}/'
                    os.makedirs(output_dir, exist_ok=True)
                    extract_images_from_pdf(pdf.file.path, output_dir, pdf.id, password)
                    pdf.decrypted = True
                    pdf.save()
                    messages.success(request, 'PDF Uploaded and Processed Successfully')
                except Exception as e:
                    messages.error(request, f'Error processing PDF: {e}')
                    return redirect('administration:pdf_management')

                # 3. Auto-Assign (if selected)
                if student_id:
                    # Deactivate old assignments for this student
                    PDFAssignment.objects.filter(student_id=student_id).update(is_active=False)
                    
                    assignment = PDFAssignment.objects.create(
                        student_id=student_id,
                        pdf_id=pdf.id,
                        question_paper_id=paper_id if paper_id else None,
                        is_active=True
                    )
                    
                    # Activate student account
                    student = User.objects.get(id=student_id)
                    student.is_active = True
                    student.save()
                    
                    log_admin_action(request.user, f"Assigned PDF {pdf.original_name} to student {student.username}", request)
                    messages.success(request, f'PDF Assigned to {student.username}')
                
            else:
                messages.error(request, 'Invalid form data')

        elif action == 'delete_assignment':
            assign_id = request.POST.get('assignment_id')
            PDFAssignment.objects.filter(id=assign_id).delete()
            log_admin_action(request.user, f"Deleted assignment ID {assign_id}", request)
            messages.success(request, 'Assignment removed')

    return render(request, 'administration/pdf_management.html', {
        'students': students,
        'pdfs': pdfs,
        'assignments': assignments,
        'papers': papers
    })

@login_required
@user_passes_test(is_superuser)
def action_logs(request):
    """
    View Action Logs for Audit
    """
    from faculty.models import ActionLog
    
    logs = ActionLog.objects.select_related('user').all().order_by('-timestamp')
    
    # Filter by user
    user_filter = request.GET.get('user')
    if user_filter:
        logs = logs.filter(user__username__icontains=user_filter)

    return render(request, 'administration/action_logs.html', {'logs': logs})

@login_required
@user_passes_test(is_superuser)
@login_required
@user_passes_test(lambda u: u.is_superuser)
def allocation_management(request):
    """
    Manages assignment of Answer Sheets to Faculty.
    """
    from .forms import AllocationForm
    from .models import AnswerSheet, Bundle
    from django.db import transaction
    
    # Current active assignments (using new model logic)
    assignments = AnswerSheet.objects.filter(status__in=['ASSIGNED', 'IN_PROGRESS']).select_related('assigned_to', 'bundle').order_by('-assigned_at')
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'assign_sheets':
            form = AllocationForm(request.POST)
            if form.is_valid():
                faculty = form.cleaned_data['faculty']
                bundle = form.cleaned_data['bundle']
                count = form.cleaned_data['num_sheets']
                deadline = form.cleaned_data.get('deadline')
                
                # Allocating sheets
                with transaction.atomic():
                    # Find unassigned sheets in this bundle
                    available_sheets = AnswerSheet.objects.filter(
                        bundle=bundle, 
                        status='PENDING'
                    ).select_for_update()[:count] # Lock rows
                    
                    if len(available_sheets) < count:
                        messages.warning(request, f"Requested {count} sheets, but only {len(available_sheets)} available in this bundle.")
                    
                    if available_sheets:
                        num_assigned = 0
                        from django.utils import timezone
                        question_paper = form.cleaned_data.get('question_paper')  # Get selected question paper
                        
                        for sheet in available_sheets:
                            sheet.assigned_to = faculty
                            sheet.status = 'ASSIGNED'
                            sheet.assigned_at = timezone.now()
                            if question_paper:
                                sheet.question_paper = question_paper  # Link question paper
                            sheet.save()
                            num_assigned += 1
                        
                        qp_info = f" with Question Paper {question_paper.paper_id}" if question_paper else ""
                        messages.success(request, f"Successfully assigned {num_assigned} sheets from {bundle.name} to {faculty.username}{qp_info}.")
                        log_admin_action(request.user, f"Assigned {num_assigned} sheets (Bundle {bundle.bundle_id}) to {faculty.username}{qp_info}", request)
            else:
                messages.error(request, "Invalid Allocation Form.")
                
        elif action == 'revoke_sheet':
            sheet_id = request.POST.get('sheet_id')
            try:
                sheet = AnswerSheet.objects.get(id=sheet_id)
                # Check if locked? User said "completed and... sheets re lcoks"
                if sheet.status == 'COMPLETED' and sheet.is_locked:
                    messages.error(request, "Cannot revoke a completed and locked sheet.")
                else:
                    target_user = sheet.assigned_to
                    sheet.assigned_to = None
                    sheet.status = 'PENDING' # Reset to Pending or REVOKED? User said "revoke... give reon".
                    # Let's reset to PENDING so it can be reassigned. Or maybe REVOKED status if we want to track history?
                    # Plan said REVOKED. But usually we want to reassign.
                    # I'll enable reassign immediately.
                    sheet.save()
                    messages.success(request, "Assignment revoked successfully.")
                    log_admin_action(request.user, f"Revoked sheet {sheet.answer_sheet_id} from {target_user}", request)
            except AnswerSheet.DoesNotExist:
                messages.error(request, "Sheet not found.")

    form = AllocationForm()
    
    # Calculate available sheets per bundle for display hint?
    # Could be heavy, maybe just simple list.
    
    return render(request, 'administration/allocation_management.html', {
        'form': form,
        'assignments': assignments
    })

@login_required
@user_passes_test(lambda u: u.is_superuser)
def faculty_tracking(request):
    """
    Detailed tracking of Faculty progress on assigned sheets.
    """
    from .models import AnswerSheet
    from annotator.models import PageAnnotation
    
    # Get all faculty who have assignments
    faculty_ids = AnswerSheet.objects.values_list('assigned_to', flat=True).distinct()
    faculty_users = User.objects.filter(id__in=faculty_ids)
    
    tracking_data = [] # List of dicts
    
    for fac in faculty_users:
        assignments = AnswerSheet.objects.filter(assigned_to=fac)
        total = assignments.count()
        completed = assignments.filter(status='COMPLETED').count()
        pending = assignments.filter(status='PENDING').count()
        in_progress = assignments.filter(status='IN_PROGRESS').count()
        
        # Determine last activity
        last_annotation = PageAnnotation.objects.filter(user=fac).order_by('-saved_at').first()
        last_active = last_annotation.saved_at if last_annotation else None
        
        # Detailed sheet info (optional, or separate drill-down)
        sheet_details = []
        for sheet in assignments:
            # Count annotated pages for this sheet
            # Assuming 'pdf' in PageAnnotation links to UploadedPDF which is in AnswerSheet.pdf_file
            annotated_pages = PageAnnotation.objects.filter(user=fac, pdf=sheet.pdf_file).count()
            sheet_details.append({
                'id': sheet.answer_sheet_id,
                'status': sheet.status,
                'annotated_pages': annotated_pages,
                'pdf_name': sheet.pdf_file.original_name
            })
            
        tracking_data.append({
            'faculty': fac,
            'total': total,
            'completed': completed,
            'in_progress': in_progress,
            'last_active': last_active,
            'sheets': sheet_details
        })
        
    return render(request, 'administration/faculty_tracking.html', {'tracking_data': tracking_data})

@login_required
@user_passes_test(lambda u: u.is_superuser)
def subject_management(request):
    """
    Manage subjects with auto-generated IDs.
    """
    from .forms import SubjectForm
    from .models import Subject
    from .id_utils import generate_subject_id
    
    subjects = Subject.objects.all().order_by('-created_at')
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'add_subject':
            form = SubjectForm(request.POST)
            if form.is_valid():
                name = form.cleaned_data['name']
                code = form.cleaned_data['code']
                
                # Auto-generate unique subject ID
                subject_id = generate_subject_id()
                
                # Ensure uniqueness
                while Subject.objects.filter(subject_id=subject_id).exists():
                    subject_id = generate_subject_id()
                
                Subject.objects.create(
                    subject_id=subject_id,
                    name=name,
                    code=code
                )
                
                messages.success(request, f"Subject '{name}' added with ID: {subject_id}")
                log_admin_action(request.user, f"Created subject {subject_id} - {name}", request)
            else:
                messages.error(request, "Invalid form data.")
        
        elif action == 'delete_subject':
            subject_id = request.POST.get('subject_id')
            try:
                subject = Subject.objects.get(id=subject_id)
                subject_name = subject.name
                subject.delete()
                messages.success(request, f"Subject '{subject_name}' deleted.")
                log_admin_action(request.user, f"Deleted subject {subject_name}", request)
            except Subject.DoesNotExist:
                messages.error(request, "Subject not found.")
    
    form = SubjectForm()
    
    return render(request, 'administration/subject_management.html', {
        'form': form,
        'subjects': subjects
    })

@login_required
@user_passes_test(lambda u: u.is_superuser)
def question_paper_management(request):
    """
    Manage question papers with auto-generated IDs and questions.
    """
    from .forms import QuestionPaperForm, QuestionForm
    from .models import QuestionPaper, Question
    from .id_utils import generate_paper_id, generate_question_id
    
    papers = QuestionPaper.objects.all().order_by('-created_at')
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'upload_paper':
            form = QuestionPaperForm(request.POST, request.FILES)
            if form.is_valid():
                title = form.cleaned_data['title']
                subject = form.cleaned_data['subject']
                file = request.FILES['file']
                total_marks = form.cleaned_data['total_marks']
                
                # Auto-generate unique paper ID
                paper_id = generate_paper_id()
                while QuestionPaper.objects.filter(paper_id=paper_id).exists():
                    paper_id = generate_paper_id()
                
                paper = QuestionPaper.objects.create(
                    paper_id=paper_id,
                    title=title,
                    subject=subject,
                    file=file,
                    total_marks=total_marks
                )
                
                # Try to auto-extract questions from the file
                try:
                    extracted_count = extract_questions_from_file(paper)
                    if extracted_count > 0:
                        messages.success(request, f"Question Paper '{title}' uploaded with ID: {paper_id}. Auto-extracted {extracted_count} questions!")
                    else:
                        messages.success(request, f"Question Paper '{title}' uploaded with ID: {paper_id}. No questions auto-extracted - add them manually.")
                except Exception as e:
                    messages.success(request, f"Question Paper '{title}' uploaded with ID: {paper_id}")
                    messages.warning(request, f"Could not auto-extract questions. Add them manually.")
                
                log_admin_action(request.user, f"Uploaded Question Paper {paper_id} - {title}", request)
            else:
                messages.error(request, "Invalid form data.")
        
        elif action == 'add_question':
            paper_id = request.POST.get('paper_id')
            question_form = QuestionForm(request.POST)
            
            if question_form.is_valid():
                try:
                    paper = QuestionPaper.objects.get(id=paper_id)
                    description = question_form.cleaned_data['description']
                    max_marks = question_form.cleaned_data['max_marks']
                    
                    # Auto-assign index number
                    existing_count = paper.questions.count()
                    index_number = existing_count + 1
                    
                    # Generate question ID
                    question_id = generate_question_id(paper.paper_id, index_number)
                    while Question.objects.filter(question_id=question_id).exists():
                        index_number += 1
                        question_id = generate_question_id(paper.paper_id, index_number)
                    
                    Question.objects.create(
                        question_id=question_id,
                        paper=paper,
                        index_number=index_number,
                        description=description,
                        max_marks=max_marks
                    )
                    
                    messages.success(request, f"Question {index_number} added to {paper.title}")
                    log_admin_action(request.user, f"Added question {question_id} to paper {paper.paper_id}", request)
                except QuestionPaper.DoesNotExist:
                    messages.error(request, "Question paper not found.")
            else:
                messages.error(request, "Invalid question data.")
        
        elif action == 'delete_paper':
            paper_id = request.POST.get('paper_id')
            try:
                paper = QuestionPaper.objects.get(id=paper_id)
                # Check if any answer sheets are linked
                if paper.answer_sheets.count() == 0:
                    paper_title = paper.title
                    paper.delete()
                    messages.success(request, f"Question Paper '{paper_title}' deleted.")
                    log_admin_action(request.user, f"Deleted question paper {paper_title}", request)
                else:
                    messages.error(request, "Cannot delete paper - it's linked to answer sheets.")
            except QuestionPaper.DoesNotExist:
                messages.error(request, "Question paper not found.")
    
    paper_form = QuestionPaperForm()
    question_form = QuestionForm()
    
    return render(request, 'administration/question_paper_management.html', {
        'paper_form': paper_form,
        'question_form': question_form,
        'papers': papers
    })

from .forms import UserRegistrationForm, QuestionPaperForm, QuestionForm

@login_required
@user_passes_test(lambda u: u.is_superuser)
def create_user(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "User created successfully.")
            return redirect('administration:user_management')
    else:
        form = UserRegistrationForm()
    
    return render(request, 'administration/user_form.html', {'form': form, 'title': 'Create New User'})

from .models import QuestionPaper, Question
from django.forms import modelformset_factory

@login_required
@user_passes_test(lambda u: u.is_superuser)
def manage_papers(request):
    papers = QuestionPaper.objects.all().order_by('-created_at')
    
    if request.method == 'POST':
        if 'create_paper' in request.POST:
            form = QuestionPaperForm(request.POST)
            if form.is_valid():
                form.save()
                messages.success(request, "Question Paper Created")
                return redirect('administration:manage_papers')
    else:
        form = QuestionPaperForm()
        
    return render(request, 'administration/manage_papers.html', {'papers': papers, 'form': form})

@login_required
@user_passes_test(lambda u: u.is_superuser)
def add_questions(request, paper_id):
    paper = get_object_or_404(QuestionPaper, id=paper_id)
    QuestionFormSet = modelformset_factory(Question, form=QuestionForm, extra=1, can_delete=True)
    
    if request.method == 'POST':
        formset = QuestionFormSet(request.POST, queryset=Question.objects.filter(paper=paper))
        if formset.is_valid():
            instances = formset.save(commit=False)
            for instance in instances:
                instance.paper = paper
                instance.save()
            for obj in formset.deleted_objects:
                obj.delete()
            messages.success(request, "Questions updated successfully")
            return redirect('administration:add_questions', paper_id=paper.id)
    else:
        formset = QuestionFormSet(queryset=Question.objects.filter(paper=paper))
        
    return render(request, 'administration/add_questions.html', {'paper': paper, 'formset': formset})

from django.db import connections
from .legacy_models import (
    MUser, MStudent, UserRole, MCollege, MAcademicYear, MEvent, MCourse, 
    MCoursePart, MCoursePartTerm, MSubject, MQuestionPaper, TQuestions, 
    TSubquestions, TExaminationCopyRaw, TQuestionMarksRaw, 
    TStudentMarksObtained, MAnswerSheetAllocation, MAnswerSheetAllocationBatch
)
import datetime

@login_required
@user_passes_test(lambda u: u.is_superuser)
def sync_data(request):
    """
    Sync data from External Legacy Database
    """
    if request.method == 'POST':
        action = request.POST.get('action')
        
        try:
            with connections['external_source'].cursor() as cursor:
                import_count = 0
                
                if action == 'sync_all':
                    # ORDER MATTERS due to Foreign Keys!
                    
                    # 1. Academic Year
                    cursor.execute("SELECT * FROM m_academic_year")
                    rows = cursor.fetchall()
                    if rows:
                         columns = [col[0] for col in cursor.description]
                         for row in rows:
                             data = dict(zip(columns, row))
                             MAcademicYear.objects.update_or_create(id=data['id'], defaults=data)
                         import_count += len(rows)

                    # 2. College
                    cursor.execute("SELECT * FROM m_college")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                            data = dict(zip(columns, row))
                            MCollege.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)

                    # 3. Course
                    cursor.execute("SELECT * FROM m_course")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                            data = dict(zip(columns, row))
                            MCourse.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)

                    # 4. Course Part
                    cursor.execute("SELECT * FROM m_course_part")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                             data = dict(zip(columns, row))
                             MCoursePart.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)

                    # 5. Course Part Term
                    cursor.execute("SELECT * FROM m_course_part_term")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                             data = dict(zip(columns, row))
                             MCoursePartTerm.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)

                    # 6. Event
                    cursor.execute("SELECT * FROM m_event")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                             data = dict(zip(columns, row))
                             MEvent.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)

                    # 7. Subject
                    cursor.execute("SELECT * FROM m_subject")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                             data = dict(zip(columns, row))
                             MSubject.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)
                    
                    # 8. Users & Roles
                    # Ensure roles exist first (if applicable, or mocked)
                    cursor.execute("SELECT DISTINCT u_role FROM m_user")
                    roles = cursor.fetchall()
                    for r in roles:
                        rid = r[0]
                        UserRole.objects.get_or_create(id=rid, defaults={'role_name': f'Role {rid}'})

                    cursor.execute("SELECT * FROM m_user")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                             data = dict(zip(columns, row))
                             # Handle dates that might be 0000-00-00 (convert to None)
                             if str(data.get('u_dob')) == '0000-00-00': data['u_dob'] = None
                             if str(data.get('approved_on')) == '0000-00-00 00:00:00': data['approved_on'] = None
                             
                             MUser.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)

                    # 9. Students
                    cursor.execute("SELECT * FROM m_student")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                             data = dict(zip(columns, row))
                             MStudent.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)
                    
                    # 10. Question Papers
                    cursor.execute("SELECT * FROM m_question_paper")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                             data = dict(zip(columns, row))
                             # Fix timestamps if needed
                             MQuestionPaper.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)

                    # 11. SYNC AUTH USERS (NEW)
                    # Create Django Users from MUser table
                    m_users = MUser.objects.all()
                    created_users = 0
                    for m_user in m_users:
                        # Determine role/group
                        # Assuming m_user.u_role corresponds to some logic. 
                        # For now, let's just create the user.
                        # Password: defaults to 'osm@123' or similar for initial setup
                        
                        if not User.objects.filter(username=m_user.u_name).exists():
                             # Use u_name as username. Handle potential spaces? valid chars?
                             # Assuming u_name is clean enough.
                             clean_username = m_user.u_name.replace(" ", "_")
                             
                             new_user = User.objects.create_user(
                                 username=clean_username,
                                 email=m_user.u_email,
                                 password='osm@change_me_123'
                             )
                             # u_name might be full name or just first name. 
                             # distinct first/last unknown. use u_name as first name.
                             new_user.first_name = m_user.u_name
                             new_user.save()
                             
                             # Assign Group based on role
                             # u_role is FK, so use u_role_id
                             role_id = m_user.u_role_id
                             
                             # Role Logic (Hypothetical IDs - Adjust if needed)
                             # 1: Admin, 2: Faculty, 3: Checker?, 4: Student
                             if role_id in [2, 3]: 
                                 group, _ = Group.objects.get_or_create(name='Faculty')
                                 new_user.groups.add(group)
                             elif role_id == 4: 
                                 group, _ = Group.objects.get_or_create(name='Student')
                                 new_user.groups.add(group)
                                 
                             created_users += 1
                    
                    messages.success(request, f"Synced {import_count} records from Legacy DB. Created {created_users} new Django Users.")
                    log_admin_action(request.user, f"Synced All Data + {created_users} Users", request)


                    # 11. Questions & Subquestions
                    cursor.execute("SELECT * FROM t_questions")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                             data = dict(zip(columns, row))
                             TQuestions.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)

                    cursor.execute("SELECT * FROM t_subquestions")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                             data = dict(zip(columns, row))
                             TSubquestions.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)

                    messages.success(request, f"Full Data Sync Completed! Processed ~{import_count} records.")

                elif action == 'sync_transactions':
                    # HEAVY TABLES - might time out in browser, but valid for small datasets
                    
                    # 12. Exam Copy Raw
                    cursor.execute("SELECT * FROM t_examination_copy_raw LIMIT 5000") # Safety limit
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                             data = dict(zip(columns, row))
                             TExaminationCopyRaw.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)
                    
                    # 13. Marks
                    cursor.execute("SELECT * FROM t_question_marks_raw LIMIT 5000")
                    rows = cursor.fetchall()
                    if rows:
                        columns = [col[0] for col in cursor.description]
                        for row in rows:
                             data = dict(zip(columns, row))
                             TQuestionMarksRaw.objects.update_or_create(id=data['id'], defaults=data)
                        import_count += len(rows)

                    messages.success(request, f"Transaction Data Sync (Partial) Completed! Processed ~{import_count} records.")

        except Exception as e:
            import traceback
            traceback.print_exc()
            messages.error(request, f"Sync Failed: {str(e)}")

    return render(request, 'administration/sync_data.html')

@login_required
@user_passes_test(lambda u: u.is_superuser)
def bundle_management(request):
    from .forms import BundleUploadForm
    from .models import Bundle, AnswerSheet, Subject
    from annotator.models import UploadedPDF
    from .id_utils import generate_bundle_id, generate_sheet_id
    from django.core.files.base import ContentFile
    from django.core.files.storage import default_storage
    import zipfile
    import os
    
    bundles = Bundle.objects.all().order_by('-uploaded_at')
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'upload_bundle':
            form = BundleUploadForm(request.POST, request.FILES)
            if form.is_valid():
                name = form.cleaned_data['name']
                subject = form.cleaned_data['subject']  # This is now a Subject object
                zip_file = request.FILES['zip_file']
                password = form.cleaned_data['password']
                
                # 1. Create Bundle with auto-generated ID
                bundle_id = generate_bundle_id(subject.code if subject.code else subject.subject_id[:3])
                
                # Ensure uniqueness
                while Bundle.objects.filter(bundle_id=bundle_id).exists():
                    bundle_id = generate_bundle_id(subject.code if subject.code else subject.subject_id[:3])
                
                bundle = Bundle.objects.create(
                    bundle_id=bundle_id,
                    name=name,
                    subject=subject
                )
                
                # 2. Process ZIP and auto-count sheets
                try:
                    with zipfile.ZipFile(zip_file, 'r') as zf:
                        pdf_files = [f for f in zf.namelist() if f.lower().endswith('.pdf')]
                        count = 0
                        for i, pdf_filename in enumerate(pdf_files):
                            # Read PDF content
                            pdf_content = zf.read(pdf_filename)
                            # Create ContentFile
                            file_name = os.path.basename(pdf_filename)
                            content_file = ContentFile(pdf_content, name=file_name)
                            
                            # Save to UploadedPDF
                            save_path = f'pdfs/bundles/{bundle.id}/{file_name}'
                            saved_path = default_storage.save(save_path, content_file)
                            
                            uploaded_pdf = UploadedPDF.objects.create(
                                user=request.user,
                                file=saved_path,
                                original_name=file_name,
                                decrypted=False
                            )
                            
                            # Create AnswerSheet with unique ID
                            sheet_id = generate_sheet_id(bundle_id, i+1)
                            
                            # Ensure sheet ID uniqueness
                            while AnswerSheet.objects.filter(answer_sheet_id=sheet_id).exists():
                                sheet_id = generate_sheet_id(bundle_id, i+1000+count)
                            
                            AnswerSheet.objects.create(
                                answer_sheet_id=sheet_id,
                                bundle=bundle,
                                pdf_file=uploaded_pdf,
                                status='PENDING'
                            )
                            count += 1
                        
                        bundle.total_sheets = count
                        bundle.save()
                        
                        messages.success(request, f"Bundle '{name}' uploaded with {count} answer sheets. Subject: {subject.name}")
                        log_admin_action(request.user, f"Uploaded Bundle {bundle_id} with {count} sheets for subject {subject.name}", request)
                        
                except zipfile.BadZipFile:
                    messages.error(request, "Invalid ZIP file.")
                    bundle.delete()  # Clean up
                except Exception as e:
                    messages.error(request, f"Error processing bundle: {str(e)}")
                    bundle.delete()  # Clean up
            else:
                 messages.error(request, "Invalid form data.")

    else:
        form = BundleUploadForm()
        
    return render(request, 'administration/bundle_management.html', {
        'form': form,
        'bundles': bundles
    })

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def api_import_data(request):
    """
    API Endpoint to receive data from external source (Push Method).
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Simple Security Check
    api_key = request.headers.get('X-API-KEY')
    if api_key != 'secure-import-key-123': # In production, use settings.API_KEY
        return JsonResponse({'error': 'Unauthorized'}, status=401)
        
    try:
        body = json.loads(request.body)
        table_name = body.get('table')
        rows = body.get('data', [])
        
        if not table_name or not rows:
            return JsonResponse({'error': 'Invalid payload. "table" and "data" required.'}, status=400)
            
        # Map table names to Models
        from .legacy_models import (
            MUser, MStudent, UserRole, MCollege, MAcademicYear, MEvent, MCourse, 
            MCoursePart, MCoursePartTerm, MSubject, MQuestionPaper, TQuestions, 
            TSubquestions, TExaminationCopyRaw, TQuestionMarksRaw, 
            TStudentMarksObtained, MAnswerSheetAllocation, MAnswerSheetAllocationBatch
        )
        
        table_map = {
            'm_user': MUser,
            'm_student': MStudent,
            'user_role': UserRole,
            'm_college': MCollege,
            'm_academic_year': MAcademicYear,
            'm_event': MEvent,
            'm_course': MCourse,
            'm_course_part': MCoursePart,
            'm_course_part_term': MCoursePartTerm,
            'm_subject': MSubject,
            'm_question_paper': MQuestionPaper,
            't_questions': TQuestions,
            't_subquestions': TSubquestions,
            't_examination_copy_raw': TExaminationCopyRaw,
            't_question_marks_raw': TQuestionMarksRaw,
            't_student_marks_obtained': TStudentMarksObtained,
            'm_answer_sheet_allocation': MAnswerSheetAllocation,
            'm_answer_sheet_allocation_batch': MAnswerSheetAllocationBatch
        }
        
        model = table_map.get(table_name)
        if not model:
            return JsonResponse({'error': f'Table "{table_name}" not supported.'}, status=400)
            
        success_count = 0
        errors = []
        
        for row in rows:
            try:
                pk_val = row.get('id')
                if not pk_val:
                     model.objects.create(**row)
                else:
                    model.objects.update_or_create(id=pk_val, defaults=row)
                success_count += 1
            except Exception as e:
                errors.append(f"Row ID {row.get('id', '?')}: {str(e)}")
        
        return JsonResponse({
            'status': 'success',
            'message': f'Processed {len(rows)} rows.',
            'imported': success_count,
            'errors': errors[:10]
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def data_explorer(request):
    """
    Generic Data Explorer for Super User to view table contents.
    """
    from django.apps import apps
    from django.core.paginator import Paginator
    
    # Import Local/Modern Models
    from .models import AnswerSheet, Bundle, Subject, QuestionPaper
    from annotator.models import UploadedPDF
    from faculty.models import SavedMarksheet, MarksSummary
    
    # Import Legacy Models explicitly to ensure availability
    from .legacy_models import (
        MUser, MStudent, UserRole, MCollege, MAcademicYear, MEvent, MCourse, 
        MCoursePart, MCoursePartTerm, MSubject, MQuestionPaper, TQuestions, 
        TSubquestions, TExaminationCopyRaw, TQuestionMarksRaw, 
        TStudentMarksObtained, MAnswerSheetAllocation, MAnswerSheetAllocationBatch
    )
    
    # List of models to explore
    models_to_explore = [
        # Master Tables
        MAcademicYear, MCollege, MCourse, MCoursePart, MCoursePartTerm, 
        MEvent, MSubject, MUser, MStudent, MQuestionPaper, UserRole,
        
        # Transaction Tables
        TQuestions, TSubquestions, TExaminationCopyRaw, 
        TQuestionMarksRaw, TStudentMarksObtained, 
        
        # Allocation Tables
        MAnswerSheetAllocation, MAnswerSheetAllocationBatch,
        
        # Modern Tables
        AnswerSheet, UploadedPDF, Bundle, SavedMarksheet, MarksSummary
    ]
    
    model_names = [m.__name__ for m in models_to_explore]
    
    selected_model_name = request.GET.get('model')
    data = None
    fields = []
    
    if selected_model_name:
        for m in models_to_explore:
            if m.__name__ == selected_model_name:
                selected_model = m
                break
        
        if selected_model:
            qs = selected_model.objects.all()
            if hasattr(qs, 'order_by'):
                qs = qs.order_by('-id') if hasattr(selected_model, 'id') else qs
            
            # Fields
            fields = [f.name for f in selected_model._meta.get_fields() if f.concrete]
            
            paginator = Paginator(qs, 50)
            page_number = request.GET.get('page')
            data = paginator.get_page(page_number)
            
    return render(request, 'administration/data_explorer.html', {
        'model_names': model_names,
        'selected_model_name': selected_model_name,
        'data': data,
        'fields': fields
    })

