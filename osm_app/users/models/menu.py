from django.db import models

class menu(models.Model):
    STATUS_CHOICES = [
        ('A', 'Active'),
        ('I', 'Inactive'),
    ]

    name = models.CharField(max_length=100, null=True, blank=True)
    parent = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='children'
    )
    icons = models.CharField(max_length=50)
    urls = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='I')
    added_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'm_menu'

    def __str__(self):
        return self.name or "Unnamed Menu"
