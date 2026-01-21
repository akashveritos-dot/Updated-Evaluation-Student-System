from django.db import models
from django.contrib.auth.models import User

class UploadedPDF(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='pdfs/')
    original_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    decrypted = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.original_name} by {self.user.username}"

class PageAnnotation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pdf = models.ForeignKey(UploadedPDF, on_delete=models.CASCADE)
    page_number = models.IntegerField()
    actions = models.JSONField()
    saved_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'pdf', 'page_number')

    def __str__(self):
        return f"Annotations for {self.pdf.original_name} Page {self.page_number} by {self.user.username}"