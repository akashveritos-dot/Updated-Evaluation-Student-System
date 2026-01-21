from django.db import models
from django.contrib.auth.models import User
from annotator.models import UploadedPDF

# Create your models here.

class PDFAssignment(models.Model):
    """
    Maps a specific PDF to a Student.
    This tells us 'which answer sheet belongs to which student'.
    DEPRECATED: Moving towards Bundle/AnswerSheet logic but keeping for backward compatibility if needed.
    """
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pdf_assignments', limit_choices_to={'groups__name': 'Student'})
    pdf = models.ForeignKey(UploadedPDF, on_delete=models.CASCADE, related_name='assignments')
    # Note: question_paper FK will be added after new QuestionPaper model is defined
    # UPDATE: Need to use string reference 'QuestionPaper' because QuestionPaper is defined below
    question_paper = models.ForeignKey('QuestionPaper', on_delete=models.SET_NULL, null=True, blank=True, related_name='assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-assigned_at']
        
    def __str__(self):
        return f"{self.student.username} - {self.pdf.original_name}"

# --- NEW MODELS FOR SUPERADMIN OVERHAUL ---

class Subject(models.Model):
    """
    Represents a subject/course with auto-generated unique ID.
    """
    subject_id = models.CharField(max_length=50, unique=True, help_text="Unique Subject ID e.g. SUB-2024-001", null=True, blank=True)
    name = models.CharField(max_length=255, help_text="Subject name e.g. Mathematics", null=True, blank=True)
    code = models.CharField(max_length=20, blank=True, null=True, help_text="Subject code e.g. MATH101")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.subject_id} - {self.name}"

class QuestionPaper(models.Model):
    """
    Represents a question paper with auto-generated unique ID.
    """
    paper_id = models.CharField(max_length=50, unique=True, help_text="Unique Paper ID e.g. QP-2024-001", null=True, blank=True)
    title = models.CharField(max_length=255, help_text="Paper title e.g. Mid-Term Mathematics", null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='question_papers', null=True, blank=True)
    file = models.FileField(upload_to='question_papers/', help_text="Upload PDF, DOC, or DOCX file", null=True, blank=True)
    total_marks = models.IntegerField(default=0, help_text="Total marks for this paper")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.paper_id} - {self.title}"

class Question(models.Model):
    """
    Represents individual questions within a question paper.
    """
    question_id = models.CharField(max_length=100, unique=True, help_text="Unique Question ID e.g. QP-2024-001-Q01", null=True, blank=True)
    paper = models.ForeignKey(QuestionPaper, on_delete=models.CASCADE, related_name='questions', null=True, blank=True)
    index_number = models.IntegerField(help_text="Auto-assigned index (1, 2, 3...)", null=True, blank=True)
    description = models.TextField(help_text="Question text/description", null=True, blank=True)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, help_text="Maximum marks for this question", null=True, blank=True)
    
    class Meta:
        ordering = ['index_number']
        # ordering = ['id']
    
    def __str__(self):
        return f"{self.question_id} - Q{self.index_number}"

class Bundle(models.Model):
    """
    Represents a bulk upload of PDF answer sheets.
    """
    bundle_id = models.CharField(max_length=100, unique=True, help_text="Unique Bundle ID e.g. BND-SUBJ-2024-001")
    name = models.CharField(max_length=255, help_text="Descriptive name for the bundle")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='bundles', help_text="Subject this bundle belongs to")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    total_sheets = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.bundle_id} - {self.name} ({self.total_sheets} sheets)"

class AnswerSheet(models.Model):
    """
    Represents a single Answer Sheet PDF within a Bundle.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ASSIGNED', 'Assigned'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('REVOKED', 'Revoked'),
    ]

    answer_sheet_id = models.CharField(max_length=100, unique=True, help_text="Unique Sheet ID e.g. BND1-S001")
    bundle = models.ForeignKey(Bundle, on_delete=models.CASCADE, related_name='answer_sheets')
    pdf_file = models.ForeignKey(UploadedPDF, on_delete=models.CASCADE, related_name='answer_sheet_record')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Assignment details
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_sheets', limit_choices_to={'groups__name': 'Faculty'})
    assigned_at = models.DateTimeField(null=True, blank=True)
    
    question_paper = models.ForeignKey(QuestionPaper, on_delete=models.SET_NULL, null=True, blank=True, related_name='answer_sheets', help_text="Question paper for this answer sheet")
    
    current_page = models.IntegerField(default=0)
    is_locked = models.BooleanField(default=False) # Locked when evaluation finishes?
    
    def __str__(self):
        return f"{self.answer_sheet_id} ({self.status})"

class Allocation(models.Model):
    """
    Legacy Allocation Logic (Faculty -> Student). 
    We are keeping it to avoid breaking older code immediately, 
    but new logic should use AnswerSheet.assigned_to directly.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]
    
    faculty = models.ForeignKey(User, on_delete=models.CASCADE, related_name='allocations_received', limit_choices_to={'groups__name': 'Faculty'})
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='allocations_given', limit_choices_to={'groups__name': 'Student'})
    batch = models.CharField(max_length=50, blank=True, null=True, help_text="e.g. Batch A, Section B")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('faculty', 'student') 
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.faculty.username} -> {self.student.username} [{self.status}]"

from .legacy_models import *
