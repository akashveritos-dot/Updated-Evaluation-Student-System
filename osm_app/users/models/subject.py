from django.db import models
from .course import course

class subject(models.Model):
    STATUS_CHOICES = [
            ('A', 'Active'),
            ('I', 'Inactive'),
    ]
    course = models.ForeignKey(course, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=55)
    code = models.CharField(max_length=10, null=True, blank=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES)
    added_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'm_subject'
        managed = False  # Legacy table, don't manage with migrations

    def __str__(self):
        return f"{self.name} ({self.code})" if self.code else self.name
