
import os
import json
import io
from pathlib import Path
from django.conf import settings
from django.core.files.base import ContentFile
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
import fitz  # PyMuPDF
from faculty.models import SavedMarksheet, MarksSummary

def generate_evaluation_pdf(processed_data, faculty_user, original_pdf_path=None, demo_images=None, is_demo=False):
    """
    Generates a final PDF with:
    1. Summary Page (Marks Table, Stats)
    2. Original PDF pages with annotations 'burned in' (or appended images for demo)
    
    processed_data: dict containing:
        - total_marks
        - total_questions
        - question_details (list of dicts: question_no, marks_obtained, max_marks, remarks, page_num)
        - action_log (list of strings or dicts)
        - submission_id (optional)
        - subject_name (optional)
        - student_name (optional)
    
    Returns: ContentFile (Django friendly file object)
    """
    
    # 1. Generate Summary Page
    summary_buffer = io.BytesIO()
    doc = SimpleDocTemplate(summary_buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        alignment=1, # Center
        spaceAfter=30
    )
    elements.append(Paragraph("Evaluation Summary", title_style))
    elements.append(Spacer(1, 20))
    
    # Meta Info Table
    meta_data = [
        ["Evaluator:", faculty_user.username],
        ["Date:", processed_data.get('date', '')],
        ["Subject:", processed_data.get('subject_name', 'N/A')],
        ["Student ID/Code:", processed_data.get('student_name', 'N/A')],
    ]
    meta_table = Table(meta_data, colWidths=[150, 300])
    meta_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 30))
    
    # Marks Breakdown Table
    # Header
    table_data = [['Q. No', 'Obtained', 'Max Marks', 'Remarks']]
    
    # Rows
    for q in processed_data.get('question_details', []):
        table_data.append([
            str(q.get('question_no', '-')),
            str(q.get('marks_obtained', 0)),
            str(q.get('max_marks', 0)),
            str(q.get('remarks', ''))
        ])
        
    # Total Row
    table_data.append(['TOTAL', str(processed_data.get('total_marks', 0)), '', ''])
    
    t = Table(table_data, colWidths=[60, 80, 80, 250])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,-1), (-1,-1), colors.beige),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 30))
    
    # Action Log / Audit Trail
    elements.append(Paragraph("Action Log", styles['Heading2']))
    
    action_data = [['Time', 'Action']]
    for action in processed_data.get('action_log', []):
        # Assuming action is "Time: Description" or similar string
        # If it's a dict, adjust access
        if isinstance(action, dict):
             action_data.append([action.get('time', '-'), action.get('description', '-')])
        else:
             action_data.append(['-', str(action)])
             
    if len(action_data) > 1:
        at = Table(action_data, colWidths=[100, 350])
        at.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('FONTSIZE', (0,0), (-1,-1), 8),
        ]))
        elements.append(at)
    else:
        elements.append(Paragraph("No specific actions recorded.", styles['Normal']))
        
    doc.build(elements)
    summary_pdf_bytes = summary_buffer.getvalue()
    
    # 2. Merge with Original/Annotated PDF
    try:
        if is_demo and demo_images:
            # Create PDF from images
            original_doc = fitz.open()
            for img_path in demo_images:
                # img_path might be URL, need local path
                # Assuming simple mapping for now or processed before calling this
                if os.path.exists(img_path):
                    img = fitz.open(img_path)
                    rect = img[0].rect
                    pdfbytes = img.convert_to_pdf()
                    img.close()
                    imgPDF = fitz.open("pdf", pdfbytes)
                    page = original_doc.new_page(width=rect.width, height=rect.height)
                    page.show_pdf_page(rect, imgPDF, 0)
                else:
                    # If passed as URL in demo, we might skip or fail. 
                    # For robust demo, we assume local paths are resolved.
                    pass
        elif original_pdf_path and os.path.exists(original_pdf_path):
            original_doc = fitz.open(original_pdf_path)
        else:
            original_doc = fitz.open() # Empty new PDF if nothing found
            
        # Draw Annotations (Stamps: SEEN, BLANK)
        # We need the 'annotations' data passed in processed_data or separately
        annotations = processed_data.get('annotations', {}) # { page_num: ['seen', 'blank'] }
        
        for page_idx in range(len(original_doc)):
            page_num = page_idx + 1
            page_anns = annotations.get(page_num, [])
            page = original_doc[page_idx]
            
            for ann in page_anns:
                if ann == 'seen':
                    # Draw eye/seen stamp
                    page.insert_text((50, 50), "SEEN", fontsize=30, color=(0, 0, 1), rotate=45, check_no_subset=False)
                elif ann == 'mark_blank':
                     # Draw Blank stamp
                    page.insert_text((original_doc[page_idx].rect.width/2 - 100, original_doc[page_idx].rect.height/2), "BLANK PAGE", fontsize=60, color=(0.5, 0.5, 0.5), rotate=45, check_no_subset=False)
        
        # Merge Summary at the BEGINNING
        summary_doc = fitz.open("pdf", summary_pdf_bytes)
        summary_doc.insert_pdf(original_doc) # Insert original AFTER summary (Wait, insert_pdf appends by default? No, use insert logic)
        
        # Actually easier: Create new doc, insert summary, insert original
        final_doc = fitz.open()
        final_doc.insert_pdf(summary_doc)
        final_doc.insert_pdf(original_doc)
        
        output_buffer = io.BytesIO()
        final_doc.save(output_buffer)
        final_doc.close()
        original_doc.close()
        summary_doc.close()
        
        return ContentFile(output_buffer.getvalue(), name=f"evaluated_sheet.pdf")
        
    except Exception as e:
        print(f"Error generating PDF: {e}")
        # Fallback to just summary if merge fails
        return ContentFile(summary_pdf_bytes, name="summary_only_error.pdf")

