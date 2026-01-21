from django.db import models
from django.contrib.auth.models import User

class EvaluationSubmission(models.Model):
    """Stores completed evaluation submissions with all question data"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    total_questions = models.IntegerField()
    total_marks_obtained = models.FloatField()
    total_marks_possible = models.FloatField()
    time_taken = models.CharField(max_length=20)  # Format: HH:MM:SS
    pdf_path = models.CharField(max_length=500)
    is_locked = models.BooleanField(default=True)
    
    # Store the complete evaluation data as JSON
    questions_data = models.JSONField()
    paper_sheet_data = models.JSONField()
    images_data = models.JSONField()
    
    class Meta:
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"Evaluation by {self.user.username} at {self.submitted_at}"

class QuestionResult(models.Model):
    """Stores individual question results for detailed analysis"""
    submission = models.ForeignKey(EvaluationSubmission, on_delete=models.CASCADE, related_name='question_results')
    question_id = models.IntegerField()
    question_no = models.CharField(max_length=50)
    question_text = models.TextField()
    marks_obtained = models.FloatField()
    marks_total = models.FloatField()
    status = models.CharField(max_length=20)  # A, OA, NA, NM
    tools_used = models.JSONField(default=list)  # List of tools applied to this question
    
    class Meta:
        ordering = ['question_no']
    
    def __str__(self):
        return f"Q{self.question_no}: {self.marks_obtained}/{self.marks_total}"

class ActionLog(models.Model):
    """
    Maps to the existing administration_actionlog table to store audit trails.
    """
    action_description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.CharField(max_length=39, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'administration_actionlog'
        managed = False  # InspectDB-style model since table exists

class SheetEvaluation(models.Model):
    """
    Stores evaluation data for an answer sheet.
    """
    sheet = models.ForeignKey('administration.AnswerSheet', on_delete=models.CASCADE, related_name='evaluations')
    faculty = models.ForeignKey(User, on_delete=models.CASCADE)
    total_marks_obtained = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    is_completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['sheet', 'faculty']
    
    def __str__(self):
        return f"Evaluation of {self.sheet.answer_sheet_id} by {self.faculty.username}"

class QuestionEvaluation(models.Model):
    """
    Stores marks for individual questions in an evaluation.
    """
    evaluation = models.ForeignKey(SheetEvaluation, on_delete=models.CASCADE, related_name='question_evaluations')
    question_id = models.CharField(max_length=100, help_text="Question ID from QuestionPaper")
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    remarks = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['evaluation', 'question_id']
    
    def __str__(self):
        return f"{self.question_id}: {self.marks_obtained} marks"

class SavedMarksheet(models.Model):
    """
    Stores the final generated PDF marksheet with summary.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    original_filename = models.CharField(max_length=255)
    saved_file = models.FileField(upload_to='evaluated_sheets/')
    created_at = models.DateTimeField(auto_now_add=True)
    # Optional link to the original submission/sheet if available (nullable for demo users)
    submission_id = models.CharField(max_length=100, blank=True, null=True) 
    
    def __str__(self):
        return f"Saved Marksheet: {self.original_filename} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"

class MarksSummary(models.Model):
    """
    Stores the structured summary of marks associated with a saved marksheet.
    """
    saved_marksheet = models.OneToOneField(SavedMarksheet, on_delete=models.CASCADE, related_name='summary', null=True)
    total_questions = models.IntegerField()
    total_marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    # Detailed JSON breakdown: { "Q1": {"obtained": 5, "max": 10, "page": 2}, ... }
    question_details = models.JSONField(default=dict)
    
    def __str__(self):
        return f"Summary for {self.saved_marksheet.original_filename}"
