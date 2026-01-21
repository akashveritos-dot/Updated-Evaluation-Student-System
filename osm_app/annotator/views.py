from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .forms import UploadPDFForm
from .models import UploadedPDF, PageAnnotation
from django.http import JsonResponse
from django.core.files.storage import FileSystemStorage
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import os
import json
import base64
from django.utils import timezone
from .utils import extract_images_from_pdf
from django.conf import settings

@login_required
def upload_pdf(request):
    if request.method == 'POST':
        form = UploadPDFForm(request.POST, request.FILES)
        if form.is_valid():
            uploaded_file = request.FILES['file']
            password = form.cleaned_data.get('password')
            
            # Save the uploaded file to the media directory
            fs = FileSystemStorage(location='media/pdfs')
            filename = fs.save(uploaded_file.name, uploaded_file)
            
            # Create a new UploadedPDF entry in the database
            pdf = UploadedPDF.objects.create(
                user=request.user,
                file=f'pdfs/{filename}',
                original_name=uploaded_file.name,
                decrypted=False
            )
            
            # Place to add decryption + image extraction logic
            pdf_path = pdf.file.path
            output_dir = f'media/pdf_images/pdf_{pdf.id}/'
            
            # Ensure the output directory exists
            os.makedirs(output_dir, exist_ok=True)
            
            try:
                # Extract images from the PDF
                extract_images_from_pdf(pdf_path, output_dir, pdf.id, password)
                
                # If extraction is successful, update the decrypted flag
                pdf.decrypted = True
                pdf.save()

                # Redirect to the annotation page
                return redirect('annotate_pdf', pdf_id=pdf.id)
            except Exception as e:
                # Handle errors (e.g., password incorrect, file issue)
                pdf.decrypted = False
                pdf.save()
                print(f"Error during PDF extraction: {e}")
                # You can add a custom error message for the user here if needed
                return render(request, 'annotator/upload.html', {'form': form, 'error': 'Error during PDF extraction.'})
    
    else:
        form = UploadPDFForm()

    return render(request, 'annotator/upload.html', {'form': form})

@login_required
def annotate_pdf(request, pdf_id):
    pdf = UploadedPDF.objects.get(id=pdf_id)
    pdf_path = pdf.file.path
    images_dir = os.path.join(settings.MEDIA_ROOT, f'pdf_images/pdf_{pdf_id}')
    
    # Count the number of page images in the directory
    try:
        total_pages = len([f for f in os.listdir(images_dir) if f.startswith('page_') and f.endswith('.jpg')])
    except FileNotFoundError:
        total_pages = 0  # If the directory doesn't exist, we assume there are no images

    return render(request, 'annotator/annotate.html', {
        'pdf': pdf,
        'total_pages': total_pages
    })


@login_required
def save_annotation(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        pdf_id = data.get('pdf_id')
        page = data.get('page_number')
        actions = data.get('actions')

        pdf = get_object_or_404(UploadedPDF, id=pdf_id, user=request.user)

        annotation, created = PageAnnotation.objects.update_or_create(
            user=request.user,
            pdf=pdf,
            page_number=page,
            defaults={'actions': actions}
        )
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'invalid request'})

@login_required
def load_annotation(request):
    pdf_id = request.GET.get('pdf_id')
    page_number = request.GET.get('page_number')
    try:
        annotation = PageAnnotation.objects.get(
            user=request.user, pdf_id=pdf_id, page_number=page_number
        )
        return JsonResponse({'status': 'success', 'actions': annotation.actions})
    except PageAnnotation.DoesNotExist:
        return JsonResponse({'status': 'not_found', 'actions': []})

@login_required
def submit_evaluation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Process submission data
            images = data.get('images', [])
            paperSheet = data.get('paperSheet', {})
            questions = data.get('questions', [])
            timeTaken = data.get('timeTaken', '00:00:00')
            totalMarks = data.get('totalMarks', 0)
            totalPossibleMarks = data.get('totalPossibleMarks', 0)
            
            # Here you would typically save the evaluation data to the database
            # For now, just return success response
            
            return JsonResponse({
                'success': True,
                'message': 'Evaluation submitted successfully',
                'data': {
                    'totalMarks': totalMarks,
                    'totalPossibleMarks': totalPossibleMarks,
                    'timeTaken': timeTaken,
                    'questionsCount': len(questions)
                }
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'message': 'Invalid JSON data'
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Submission error: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'message': 'Invalid request method'
    }, status=405)