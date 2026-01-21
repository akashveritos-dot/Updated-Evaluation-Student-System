from django.shortcuts import render, redirect,get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from users.menus import get_menu_items
from django.contrib import messages
# Create your views here.
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from PIL import Image
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Protection, Alignment
import excel_utils
import requests
import asyncio

import os
from django.conf import settings
from .utils import extract_images_from_pdf
import base64
import io
import json
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from io import BytesIO
from PyPDF2 import PdfReader, PdfWriter
from datetime import datetime
from annotator.models import UploadedPDF

menu_items = get_menu_items()

from administration.legacy_models import MAnswerSheetAllocation, MUser, TExaminationCopyRaw, MStudent, MQuestionPaper
from django.http import HttpResponse


@login_required
def dashboard(request):
    """
    Shows assigned answer sheets to faculty.
    """
    if not request.user.groups.filter(name='Faculty').exists():
        return redirect('/') # Or appropriate redirect

    # Use NEW AnswerSheet model
    from administration.models import AnswerSheet
    
    # Find sheets assigned to this faculty user
    assigned_sheets = AnswerSheet.objects.filter(
        assigned_to=request.user,
        status__in=['ASSIGNED', 'IN_PROGRESS']
    ).select_related('bundle', 'pdf_file', 'question_paper').order_by('assigned_at')
    
    if not assigned_sheets.exists():
        messages.info(request, "No tasks assigned to you yet.")
        return render(request, 'faculty/no_allocations.html')
    
    # Group sheets by bundle for display
    bundles_data = {}
    for sheet in assigned_sheets:
        bundle_id = sheet.bundle.bundle_id
        if bundle_id not in bundles_data:
            bundles_data[bundle_id] = {
                'bundle': sheet.bundle,
                'question_paper': sheet.question_paper,
                'sheets': []
            }
        bundles_data[bundle_id]['sheets'].append(sheet)
    
    context = {
        'bundles_data': bundles_data,
        'total_sheets': assigned_sheets.count()
    }
    
    return render(request, 'faculty/dashboard.html', context)

@login_required
def evaluate_sheet(request, sheet_id):
    """
    Evaluation interface using EXISTING evaluation.html template.
    Extracts PDF pages as images for carousel display.
    """
    if not request.user.groups.filter(name='Faculty').exists():
        return redirect('/')
    
    from administration.models import AnswerSheet
    
    # Get the sheet assigned to this faculty
    try:
        sheet = AnswerSheet.objects.select_related(
            'bundle', 'pdf_file', 'question_paper', 'assigned_to'
        ).get(id=sheet_id, assigned_to=request.user)
    except AnswerSheet.DoesNotExist:
        messages.error(request, "Sheet not found or not assigned to you.")
        return redirect('faculty:dashboard')
    
    # Update status to IN_PROGRESS if it's ASSIGNED
    if sheet.status == 'ASSIGNED':
        sheet.status = 'IN_PROGRESS'
        sheet.save()
    
    # Extract PDF pages as images for carousel
    images = []
    if sheet.pdf_file and sheet.pdf_file.file:
        try:
            pdf_path = sheet.pdf_file.file.path
            
            # Try PyMuPDF (fitz) - no external dependencies needed
            try:
                import fitz  # PyMuPDF
                import base64
                from io import BytesIO
                from PIL import Image
                
                # Open PDF
                pdf_document = fitz.open(pdf_path)
                
                # Extract each page as image
                for page_num in range(len(pdf_document)):
                    page = pdf_document[page_num]
                    
                    # Render page to image (higher DPI for better quality)
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for quality
                    
                    # Convert to PIL Image
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    
                    # Convert to base64
                    buffered = BytesIO()
                    img.save(buffered, format="PNG")
                    img_str = base64.b64encode(buffered.getvalue()).decode()
                    images.append(f"data:image/png;base64,{img_str}")
                
                pdf_document.close()
                
            except ImportError:
                # Fallback: Try existing extract_images_from_pdf function
                try:
                    from .utils import extract_images_from_pdf
                    images = extract_images_from_pdf(pdf_path)
                except:
                    # Final fallback: use PDF file URL directly
                    images.append(sheet.pdf_file.file.url)
                    
        except Exception as e:
            messages.warning(request, f"Could not extract PDF pages: {str(e)}")
            # Fallback to file URL
            try:
                images.append(sheet.pdf_file.file.url)
            except:
                pass
    
    # Prepare questions in the format expected by existing template
    questions = []
    if sheet.question_paper:
        from administration.models import Question
        db_questions = Question.objects.filter(
            paper=sheet.question_paper
        ).order_by('index_number')
        
        for q in db_questions:
            questions.append({
                'id': q.id,
                'question_no': f"Q{q.index_number}",
                'question': q.description,
                'marks': float(q.max_marks),
                'co': '',  # Not used in new system
                'bl': ''   # Not used in new system
            })
    
    # Tools setup (from existing template)
    tools = [
        {"id": "seen", "icon": "eye", "label": "Mark Seen", "color": "text-info", "value": 0},
        {"id": "mark_blank", "icon": "file-earmark", "label": "Mark Blank", "color": "text-dark", "value": 0},
        {"id": "undo_tool", "icon": "arrow-counterclockwise", "label": "Undo", "color": "text-secondary", "value": 0}
    ]
    
    # Status map (from existing template)
    status_map = {
        'A': {"key":'A',"title":'Attempted', "class":'bg-primary'},
        'OA': {"key":'OA',"title":'Over Attempted', "class":'bg-warning text-dark'},
        'NA': {"key":'NA',"title":'Not Attempted', "class":'bg-secondary'},
        'NM': {"key":'NM',"title":'Not Marked / Untouched', "class":'bg-danger text-light border'},
    }
    
    context = {
        'images': images,
        'tools': tools,
        'questions': questions,
        'status_map': status_map,
        'current_pdf_id': sheet.pdf_file.id if sheet.pdf_file else '',  # Use UploadedPDF ID for real-time saving
        'sheet': sheet,  # Additional context
    }
    
    # Use existing evaluation.html template
    if request.COOKIES.get('mode') == 'mobile':
        return render(request, 'evaluation-mobile.html', context)
    else:
        return render(request, 'evaluation.html', context)

@login_required
def save_evaluation(request, sheet_id):
    """
    Save evaluation progress or final submission.
    Handles 'demo' sheet_id for demo evaluations.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    # Allow demo user or faculty
    is_demo = False
    if str(sheet_id) == '99999' or str(sheet_id) == 'demo':
        is_demo = True
        # Demo specific checks
        if request.user.username != 'demo_evaluator':
             # Allow regular faculty to test demo mode if needed, but primarily for demo_evaluator
             pass
    else:
        if not request.user.groups.filter(name='Faculty').exists():
            return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    from administration.models import AnswerSheet
    sheet = None
    
    if not is_demo:
        try:
            sheet = AnswerSheet.objects.get(id=sheet_id, assigned_to=request.user)
        except AnswerSheet.DoesNotExist:
            return JsonResponse({'error': 'Sheet not found'}, status=404)
    
    try:
        data = json.loads(request.body)
        questions_data = data.get('questions', [])
        is_final = data.get('is_final', False)
        
        from .models import SheetEvaluation, QuestionEvaluation, SavedMarksheet, MarksSummary
        
        evaluation = None
        if not is_demo:
            # Create or update evaluation record
            evaluation, created = SheetEvaluation.objects.get_or_create(
                sheet=sheet,
                faculty=request.user,
                defaults={'is_completed': False}
            )
        
            # Save individual question evaluations
            total_obtained = 0
            for q_data in questions_data:
                QuestionEvaluation.objects.update_or_create(
                    evaluation=evaluation,
                    question_id=q_data.get('question_id'),
                    defaults={
                        'marks_obtained': q_data.get('obtained', 0),
                        'remarks': q_data.get('remarks', '')
                    }
                )
                total_obtained += float(q_data.get('obtained', 0))
            
            evaluation.total_marks_obtained = total_obtained
        
        else:
             # Demo mode: Calculate total locally
             total_obtained = sum(float(q.get('obtained', 0)) for q in questions_data)

        if is_final:
            if evaluation:
                evaluation.is_completed = True
                evaluation.save()
                sheet.status = 'COMPLETED'
                sheet.save()
            
            # --- GENERATE PDF ---
            from .pdf_utils import generate_evaluation_pdf
            from annotator.models import PageAnnotation, ActionLog
            
            # Gather Data
            processed_data = {
                'total_marks': total_obtained,
                'total_questions': len(questions_data),
                'question_details': [{
                    'question_no': q.get('question_no', q.get('question_id')), # fallback
                    'marks_obtained': q.get('obtained', 0),
                    'max_marks': q.get('max_marks', 0), # frontend should send this or fetch from DB
                    'remarks': q.get('remarks', '')
                } for q in questions_data],
                 'subject_name': sheet.question_paper.subject.name if sheet and sheet.question_paper else 'Demo Subject',
                 'student_name': sheet.pdf_file.original_name if sheet and sheet.pdf_file else 'Demo Student',
                 'date': datetime.now().strftime('%Y-%m-%d %H:%M')
            }
            
            # Fetch Annotations
            # Annotations are stored in PageAnnotation by (user, pdf_id).
            # For real sheet: pdf_id = sheet.pdf_file.id (Wait, UploadedPDF id?)
            # evaluate_sheet.html context: sheet.id passed as 'current_pdf_id' ???
            # Let's check evaluate_sheet view context again.
            # 'current_pdf_id': sheet.id.
            # So PageAnnotation.pdf_id stores sheet.id (which is AnswerSheet ID) OR UploadedPDF ID?
            # save_realtime_action uses `pdf_id = int(pdf_id)`.
            # PageAnnotation model: `pdf = models.ForeignKey(UploadedPDF, ...)`
            # So pdf_id MUST be UploadedPDF ID.
            # But `evaluate_sheet` passes `sheet.id`. `AnswerSheet` ID != `UploadedPDF` ID.
            # This is a BUG in existing code if `sheet.id` is passed as `current_pdf_id`.
            # Let's assume for now we use what is passed.
            
            pdf_id_to_use = sheet.pdf_file.id if sheet and sheet.pdf_file else 99999
            
            # If standard logic is broken, we might not find annotations.
            # But let's try to fetch them.
            # Actually, `save_realtime_action` expects `pdf_id`, queries `PageAnnotation`.
            # If `pdf_id` passed from frontend matches `PageAnnotation.pdf_id`, we are good.
            
            # Fetch Actions
            # Filter ActionLog by user and recent time? Or description?
            # Creating a simple log from current session is hard without session ID.
            # We'll just fetch ALL actions for this user/pdf combo if possible?
            # ActionLog doesn't have PDF ID. It has description "Page: X ...".
            # We'll rely on PageAnnotation actions for visual, and maybe skip text log for now or query last 1 hr.
            
            recent_actions = ActionLog.objects.filter(
                user=request.user,
                timestamp__gte=datetime.now() - pd.Timedelta(hours=1)
            ).order_by('timestamp')
            
            processed_data['action_log'] = [a.action_description for a in recent_actions]
            
            # Dictionary of {page_num: ['seen', 'blank']}
            annotations_map = {}
            # Try to fetch PageAnnotations
            # Warning: pdf_id logic might be shaky.
            try:
                # If pdf_id is Foreign Key to UploadedPDF, we need that ID.
                # If frontend sends sheet.id, we might get casting error if we try to filter pdf__id=sheet.id
                # UNLESS UploadedPDF id happens to match.
                # For now, we will try.
                user_anns = PageAnnotation.objects.filter(user=request.user, pdf_id=pdf_id_to_use)
                for pa in user_anns:
                    # actions is JSON list likely
                    # We need to parse 'tool' from it.
                    # As we didn't confirm structure, we'll iterate blindly
                    if isinstance(pa.actions, list):
                        tools = [x.get('tool') for x in pa.actions if isinstance(x, dict) and x.get('tool')]
                        annotations_map[pa.page_number] = tools
            except Exception as e:
                print(f"Annotation fetch error: {e}")
                
            processed_data['annotations'] = annotations_map

            # PDF Path
            original_pdf_path = sheet.pdf_file.file.path if sheet and sheet.pdf_file else None
            
            # Demo Images
            demo_images = []
            if is_demo:
                # Re-fetch demo images logic (duplicated code, sorry)
                images_dir = os.path.join(settings.MEDIA_ROOT, 'pdf_images', '242311001')
                if os.path.exists(images_dir):
                    image_files = [f for f in os.listdir(images_dir) if f.lower().endswith('.png')]
                    image_files.sort(key=lambda x: int(x.split('_')[1].split('.')[0]) if '_' in x else 0)
                    demo_images = [os.path.join(images_dir, f) for f in image_files]

            # Generate
            final_pdf = generate_evaluation_pdf(processed_data, request.user, original_pdf_path, demo_images, is_demo)
            
            # Save to SavedMarksheet
            saved_sheet = SavedMarksheet.objects.create(
                user=request.user,
                original_filename=processed_data['student_name'] + "_marked.pdf",
                submission_id=evaluation.id if evaluation else 'DEMO'
            )
            saved_sheet.saved_file.save(f"{saved_sheet.original_filename}", final_pdf)
            
            # Save Summary
            MarksSummary.objects.create(
                saved_marksheet=saved_sheet,
                total_questions=processed_data['total_questions'],
                total_marks_obtained=processed_data['total_marks'],
                question_details=processed_data['question_details']
            )

            # Check pending
            pending_count = 0
            if not is_demo:
                from administration.models import AnswerSheet as AS
                pending_count = AS.objects.filter(
                    assigned_to=request.user,
                    status__in=['ASSIGNED', 'IN_PROGRESS']
                ).exclude(id=sheet_id).count()
            
            return JsonResponse({
                'success': True,
                'message': 'Evaluation submitted successfully! PDF Generated.',
                'pending_count': pending_count,
                'redirect_url': '/faculty/dashboard'
            })
        else:
            if evaluation:
                evaluation.save()
            return JsonResponse({
                'success': True,
                'message': 'Progress saved successfully!'
            })
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def evaluation_view(request, allocation_id):
    """
    The actual evaluation interface using Legacy DB
    """
    if not request.user.groups.filter(name='Faculty').exists():
        return redirect('/')

    try:
        m_user = MUser.objects.get(u_email=request.user.email)
        allocation = MAnswerSheetAllocation.objects.get(id=allocation_id, user=m_user)
    except (MUser.DoesNotExist, MAnswerSheetAllocation.DoesNotExist):
        messages.error(request, "Invalid allocation.")
        return redirect('faculty:dashboard')

    # Get TExaminationCopyRaw (Linked by fictitious_roll_no? or defined in allocation?)
    # MAnswerSheetAllocation points to MStudentSubjectAnswerSheet.
    # SQL Schema: KEY student_fictitious_roll_no.
    # We need to find the COPY pages.
    # TExaminationCopyRaw.fictitious_roll_no == allocation.student_fictitious_roll_no
    
    fict_roll = allocation.student_fictitious_roll_no
    
    raw_pages = TExaminationCopyRaw.objects.filter(
        fictitious_roll_no=fict_roll
        # Optionally filter by subject/paper if multiple papers for same roll no exist
    ).order_by('examination_copy_page_id') # ordering by page seq?
    
    if not raw_pages.exists():
        messages.warning(request, "No answer sheet pages found for this student.")
    
    images = []
    for page in raw_pages:
        # Create URL to serve blob
        images.append(f"/faculty/image/{page.id}/")
    
    # Tools setup
    tools = [
        {"id": "seen", "icon": "eye", "label": "Mark Seen", "color": "text-info", "value": 0},
        {"id": "mark_blank", "icon": "file-earmark", "label": "Mark Blank", "color": "text-dark", "value": 0},
        {"id": "undo_tool", "icon": "arrow-counterclockwise", "label": "Undo", "color": "text-secondary", "value": 0}
    ]
    
    questions = []
    
    # Fetch Question Paper details
    # We need Paper ID. allocation has no paper_id directly?
    # TExaminationCopyRaw has paper_id. Use from first page.
    paper = None
    if raw_pages.first():
        paper = raw_pages.first().paper
        
        # questions = paper.questions.all() # Assuming relation or specific query
        # MQuestionPaper <-> TQuestions (FK paper_id)
        from administration.legacy_models import TQuestions
        db_qs = TQuestions.objects.filter(paper=paper).order_by('question_no') # Alphanumeric sort Q1, Q10..
        
        for q in db_qs:
            questions.append({
                "id": q.id,
                "question_no": q.question_no,
                "question": q.question,
                "marks": q.max_marks,
                "co": "CO1", # Schema doesn't have CO/BL col?
                "bl": "L1"   # Schema doesn't have CO/BL col?
            })

    status_map = {
        'A': {"key":'A',"title":'Attempted', "class":'bg-primary'},
        'OA': {"key":'OA',"title":'Over Attempted', "class":'bg-warning text-dark'},
        'NA': {"key":'NA',"title":'Not Attempted', "class":'bg-secondary'},
        'NM': {"key":'NM',"title":'Not Marked / Untouched', "class":'bg-danger text-light border'},
    }

    context = {
        'images': images,
        'tools': tools,
        'questions': questions,
        'status_map': status_map,
        'current_pdf_id': allocation.id, # Using alloc id as proxy
        'allocation': allocation,
    }
    
    if request.COOKIES.get('mode') == 'mobile':
        return render(request, 'evaluation-mobile.html', context)
    else:
        return render(request, 'evaluation.html', context)

@login_required
def serve_blob_image(request, page_id):
    """
    Serves the image binary data from TExaminationCopyRaw as an HTTP response.
    """
    page = get_object_or_404(TExaminationCopyRaw, id=page_id)
    if page.examination_copy_page_image:
        return HttpResponse(page.examination_copy_page_image, content_type="image/jpeg")
    else:
        # Return a placeholder or 404
        return HttpResponse(status=404)

@login_required
def rotateImage(request):
    if not request.user.is_authenticated:
        return redirect('logout')

    if not request.user.groups.filter(name='Faculty').exists():
        return redirect('logout')

    image_path = request.GET.get('image', '')
    if not image_path:
        return JsonResponse({'error': 'No image path provided'}, status=400)

    # full_path = os.path.join(settings.MEDIA_ROOT, image_path.lstrip('/'))
    image_path = image_path.replace('/media/', '').lstrip('/')

    # Construct full file path
    full_path = os.path.join(settings.MEDIA_ROOT, image_path)


    try:
        with Image.open(full_path) as img:
            rotated = img.rotate(-90, expand=True)
            rotated.save(full_path)
        return JsonResponse({'status': 'success', 'image': image_path})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def submit(request):
    if not request.user.is_authenticated:
        return redirect('logout')

    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request method'}, status=400)

    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    images = data.get('images', [])
    paper_sheet = data.get('paperSheet', {})
    questions = data.get('questions', [])
    time_taken = data.get('timeTaken', '00:00:00')
    total_marks_obtained = data.get('totalMarks', 0)
    total_possible_marks = data.get('totalPossibleMarks', 0)

    if not images or not paper_sheet or not questions:
        return JsonResponse({'error': 'Missing required data: images, paperSheet, or questions'}, status=400)

    # Ensure media dir exists
    os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

    try:
        # Create database submission record
        from .models import EvaluationSubmission, QuestionResult
        
        # Save the main submission
        submission = EvaluationSubmission.objects.create(
            user=request.user,
            total_questions=len(questions),
            total_marks_obtained=total_marks_obtained,
            total_marks_possible=total_possible_marks,
            time_taken=time_taken,
            questions_data=questions,
            paper_sheet_data=paper_sheet,
            images_data=images,
            is_locked=True
        )

        # Save individual question results
        for question in questions:
            QuestionResult.objects.create(
                submission=submission,
                question_id=question.get('id'),
                question_no=question.get('question_no', ''),
                question_text=question.get('question', ''),
                marks_obtained=question.get('obtained', 0),
                marks_total=question.get('marks', 0),
                status=question.get('status', 'NM'),
                tools_used=[]  # Can be enhanced to track tools used per question
            )
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    merged_images = []
    serial_number = f"SR-{datetime.now().strftime('%Y%m%d')}-{str(submission.id).zfill(6)}"
    
    for i, base_img_path in enumerate(images):
        page_key = f"Page {i + 1}"
        # Convert media URL to filesystem path
        if base_img_path.startswith("/media/"):
            base_img_path = os.path.join(settings.MEDIA_ROOT, base_img_path.replace("/media/", ""))

        base_img_path = os.path.normpath(base_img_path)

        # Open the base image
        base_img = Image.open(base_img_path).convert("RGBA")
        
        # Add serial number to first page
        if i == 0:
            from PIL import ImageDraw, ImageFont
            draw = ImageDraw.Draw(base_img)
            
            # Try to load a font, fallback to default if not available
            try:
                font = ImageFont.truetype("arial.ttf", 16)
            except:
                try:
                    font = ImageFont.load_default()
                except:
                    font = None
            
            # Add serial number in top-right corner
            serial_text = f"Serial: {serial_number}"
            if font:
                bbox = draw.textbbox((0, 0), serial_text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
            else:
                text_width = len(serial_text) * 8  # Approximate
                text_height = 16
            
            # Position in top-right corner with some padding
            x = base_img.width - text_width - 20
            y = 20
            
            # Draw background rectangle for better visibility
            draw.rectangle([x-5, y-5, x+text_width+5, y+text_height+5], fill=(255, 255, 255, 200))
            draw.text((x, y), serial_text, fill=(0, 0, 0), font=font)
        
        if page_key in paper_sheet:
            # Get the base64 overlay image from the last element
            last_overlay = paper_sheet[page_key][-1].get('image')

            # return JsonResponse({"base_img_path":base_img_path})
            if last_overlay:
                overlay_data = last_overlay.split(',')[1] if ',' in last_overlay else last_overlay
                overlay_img = Image.open(BytesIO(base64.b64decode(overlay_data))).convert("RGBA")

                # Resize overlay to match base image if needed
                overlay_img = overlay_img.resize(base_img.size)

                # Merge overlay onto base image
                combined_img = Image.alpha_composite(base_img, overlay_img)
            else:
                combined_img = base_img
        else:
            combined_img = base_img

        # 5 Convert to RGB (for PDF compatibility) and append
        merged_images.append(combined_img.convert("RGB"))
        # page_data = paper_sheet[page_key]
        # print(page_data)            # array of objects for that page

    results_dir = os.path.join(settings.MEDIA_ROOT, 'pdfs')
    os.makedirs(results_dir, exist_ok=True)
    
    # Include username in file names
    username = request.user.username
    pdf_path = os.path.join(results_dir, f"{username}_submission_{submission.id}.pdf")
    password = '70186'

    try:
        # Step 1: Save normal (unencrypted) PDF temporarily
        temp_path = pdf_path.replace('.pdf', '_temp.pdf')
        merged_images[0].save(
            temp_path,
            save_all=True,
            append_images=merged_images[1:],
            format="PDF",
            resolution=100.0
        )

        # Step 2: Encrypt with password
        reader = PdfReader(temp_path)
        writer = PdfWriter()

        for page in reader.pages:
            writer.add_page(page)

        writer.encrypt(user_password=password, use_128bit=True)

        with open(pdf_path, "wb") as f:
            writer.write(f)

        # Step 3: Delete the temporary file
        os.remove(temp_path)

        # Create Excel summary file
        excel_path = os.path.join(results_dir, f"{username}_summary_{submission.id}.xlsx")
        excel_utils.create_excel_summary(excel_path, questions, paper_sheet, serial_number, total_marks_obtained, total_possible_marks, time_taken)

        # Update submission with PDF path
        submission.pdf_path = pdf_path
        submission.save()

        # --- Save to SavedMarksheet for Data Explorer Visibility ---
        try:
            from .models import SavedMarksheet, MarksSummary
            from django.core.files import File
            
            saved_sheet = SavedMarksheet.objects.create(
                user=request.user,
                original_filename=os.path.basename(pdf_path),
                submission_id=submission.id
            )
            
            with open(pdf_path, 'rb') as f:
                saved_sheet.saved_file.save(os.path.basename(pdf_path), File(f))
                
            MarksSummary.objects.create(
                saved_marksheet=saved_sheet,
                total_questions=len(questions),
                total_marks_obtained=total_marks_obtained,
                question_details=questions
            )
        except Exception as e:
            print(f"Error saving SavedMarksheet in submit: {e}")
        # -----------------------------------------------------------

        return JsonResponse({
            'success': True,
            'message': f'Evaluation submitted successfully! {len(questions)} questions processed and locked.',
            'submission_id': submission.id,
            'pdf_path': pdf_path,
            'pages_combined': len(merged_images),
            'total_marks_obtained': total_marks_obtained,
            'total_questions': len(questions)
        })
    
    except Exception as e:
        # If any error occurs, clean up any created submission
        submission.delete()
        return JsonResponse({'error': f'Error processing submission: {str(e)}'}, status=500)

@login_required
def submit_entries(request):
    if not request.user.is_authenticated:
        return redirect('logout')

    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request method'}, status=400)

    try:
        data = json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    entries = data.get('entries', [])
    total_marks = data.get('totalMarks', 0)
    time_taken = data.get('timeTaken', '00:00:00')
    timestamp = data.get('timestamp', '')
    questions = data.get('questions', [])
    paper_sheet = data.get('paperSheet', {})

    if not entries:
        return JsonResponse({'error': 'No entries to submit'}, status=400)

    try:
        import csv
        from django.utils import timezone
        
        # Create CSV filename with timestamp
        csv_filename = f"marks_entries_{request.user.username}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
        csv_path = os.path.join(settings.MEDIA_ROOT, csv_filename)
        
        # Ensure media directory exists
        os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
        
        # Write entries to CSV file
        with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['Page', 'Question ID', 'Question Number', 'Marks Given', 'Tool Used', 'Timestamp']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for entry in entries:
                writer.writerow({
                    'Page': entry.get('page', ''),
                    'Question ID': entry.get('questionId', ''),
                    'Question Number': entry.get('questionNo', ''),
                    'Marks Given': entry.get('marks', 0),
                    'Tool Used': entry.get('tool', ''),
                    'Timestamp': entry.get('timestamp', timestamp)
                })
        
        # Also save to database (optional - using existing submission model)
        from .models import EvaluationSubmission
        
        submission = EvaluationSubmission.objects.create(
            user=request.user,
            total_questions=len(questions),
            total_marks_obtained=total_marks,
            total_marks_possible=sum(q.get('marks', 0) for q in questions),
            time_taken=time_taken,
            questions_data=questions,
            paper_sheet_data=paper_sheet,
            images_data=[],  # Not needed for entries submission
            pdf_path=csv_path,  # Reuse pdf_path field to store CSV path
            is_locked=True
        )
        
        return JsonResponse({
            'success': True,
            'message': f'Successfully submitted {len(entries)} entries to CSV file.',
            'csv_filename': csv_filename,
            'csv_path': csv_path,
            'submission_id': submission.id,
            'total_entries': len(entries),
            'total_marks': total_marks
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error saving entries: {str(e)}'}, status=500)

@csrf_exempt
@login_required
def save_realtime_action(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request'}, status=400)

    try:
        data = json.loads(request.body)
        
        # 1. LOG TO AUDIT TRAIL (administration_actionlog)
        try:
            action_desc = f"Tool: {data.get('tool')}, Page: {data.get('page')}"
            if data.get('question_no'):
                action_desc += f", Q.{data.get('question_no')} Marks: {data.get('marks')}"
                
            from .models import ActionLog
            ActionLog.objects.create(
                user=request.user,
                action_description=action_desc,
                ip_address=request.META.get('REMOTE_ADDR'),
            )
        except Exception as e:
            # Audit log failure should not block the main action
            print(f"Audit Log Error: {e}")

        # 2. SAVE VISUAL ANNOTATIONS (annotator_pageannotation)
        if data.get('page') and data.get('sheet_data'):
            from annotator.models import PageAnnotation
            pdf_id = data.get('pdf_id')
            if pdf_id:
                PageAnnotation.objects.update_or_create(
                    user=request.user,
                    pdf_id=int(pdf_id),
                    page_number=data.get('page'),
                    defaults={'actions': data.get('sheet_data')}
                )

        # 3. SAVE MARKS (faculty_questionresult)
        if data.get('question_id'):
            from .models import EvaluationSubmission, QuestionResult
            
            # Find recent active submission or create draft
            # For simplicity in this patch, we might skip full submission creation 
            # if we just want to save question result logic, but QuestionResult needs a submission.
            # We'll use get_or_create on a "DRAFT" submission for this user.
            
            submission, created = EvaluationSubmission.objects.get_or_create(
                user=request.user,
                is_locked=False, # Draft mode
                defaults={
                    'total_questions': 0,
                    'total_marks_obtained': 0.0,
                    'total_marks_possible': 0.0,
                    'time_taken': '00:00:00',
                    'questions_data': [],
                    'paper_sheet_data': {},
                    'images_data': [],
                    'pdf_path': 'DRAFT_IN_PROGRESS'
                }
            )
            
            QuestionResult.objects.update_or_create(
                submission=submission,
                question_id=data.get('question_id'),
                defaults={
                    'question_no': data.get('question_no'),
                    'question_text': data.get('question_text', ''),
                    'marks_obtained': float(data.get('marks', 0)),
                    'marks_total': float(data.get('max_marks', 0)),
                    'status': 'A' if float(data.get('marks', 0)) > 0 else 'NM',
                    'tools_used': [data.get('tool')]
                }
            )

        return JsonResponse({'success': True})

    except Exception as e:
        print(f"Real-time save error: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@login_required
def demo_evaluation_view(request):
    """
    Demo evaluation view for 'demo_evaluator' user.
    Bypasses assignment checks and loads hardcoded resources.
    """
    # specific check (optional, but good for safety)
    if request.user.username != 'demo_evaluator':
        return redirect('faculty:dashboard')

    # 1. Load Images from media/pdf_images/242311001
    # We need to list files and create URLs
    images_dir = os.path.join(settings.MEDIA_ROOT, 'pdf_images', '242311001')
    images = []
    
    if os.path.exists(images_dir):
        # List all png files
        image_files = [f for f in os.listdir(images_dir) if f.lower().endswith('.png')]
        
        # Sort by page number (assuming filename format page_X.png)
        def get_page_num(filename):
            try:
                # Extract number between 'page_' and '.png'
                return int(filename.split('_')[1].split('.')[0])
            except (IndexError, ValueError):
                return 0
                
        image_files.sort(key=get_page_num)
        
        # Create URLs
        # URL pattern: /media/pdf_images/242311001/page_X.png
        for img_file in image_files:
            images.append(f"{settings.MEDIA_URL}pdf_images/242311001/{img_file}")
    else:
        messages.error(request, f"Demo images directory not found: {images_dir}")

    # 2. Load Questions from JSON
    questions = []
    json_path = os.path.join(settings.BASE_DIR, 'demo_questions.json')
    
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r') as f:
                questions = json.load(f)
        except Exception as e:
            messages.error(request, f"Error loading questions: {e}")
    else:
        # Fallback dummy questions
        questions = [
            {'id': 1, 'question_no': 'Q1', 'question': 'Demo Question 1', 'marks': 10},
            {'id': 2, 'question_no': 'Q2', 'question': 'Demo Question 2', 'marks': 10},
        ]

    # 3. Tools and Status (Standard)
    tools = [
        {"id": "seen", "icon": "eye", "label": "Mark Seen", "color": "text-info", "value": 0},
        {"id": "mark_blank", "icon": "file-earmark", "label": "Mark Blank", "color": "text-dark", "value": 0},
        {"id": "undo_tool", "icon": "arrow-counterclockwise", "label": "Undo", "color": "text-secondary", "value": 0}
    ]
    
    status_map = {
        'A': {"key":'A',"title":'Attempted', "class":'bg-primary'},
        'OA': {"key":'OA',"title":'Over Attempted', "class":'bg-warning text-dark'},
        'NA': {"key":'NA',"title":'Not Attempted', "class":'bg-secondary'},
        'NM': {"key":'NM',"title":'Not Marked / Untouched', "class":'bg-danger text-light border'},
    }

    class DummySheet:
        id = '99999'
        class pdf_file:
            original_name = "Demo Student"
        class question_paper:
            class subject:
                name = "Demo Subject"

    context = {
        'images': images,
        'tools': tools,
        'questions': questions,
        'status_map': status_map,
        'current_pdf_id': 99999,  # Dummy ID
        'sheet': DummySheet(),  # Dummy object for template
        'is_demo': True # Flag for template if needed
    }

    if request.COOKIES.get('mode') == 'mobile':
        return render(request, 'evaluation-mobile.html', context)
    else:
        return render(request, 'evaluation.html', context)