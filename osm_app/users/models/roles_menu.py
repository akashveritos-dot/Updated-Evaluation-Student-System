from django.db import models
from .roles import roles
from .menu import menu  # Assuming these are defined in the same app

class roles_menu(models.Model):
    PERMISSION_CHOICES = [
        ('Y', 'Yes'),
        ('N', 'No'),
    ]

    role = models.ForeignKey(roles, on_delete=models.CASCADE)
    menu = models.ForeignKey(menu, on_delete=models.CASCADE)

    add_allowed = models.CharField(max_length=1, choices=PERMISSION_CHOICES, default='Y')
    updt_allowed = models.CharField(max_length=1, choices=PERMISSION_CHOICES, default='Y')
    del_allowed = models.CharField(max_length=1, choices=PERMISSION_CHOICES, default='Y')
    view_allowed = models.CharField(max_length=1, choices=PERMISSION_CHOICES)

    menu_order = models.IntegerField(null=True, blank=True)

    added_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'm_roles_menu'
        unique_together = ('role', 'menu')

    def __str__(self):
        return f"{self.role.name} - {self.menu.name}"
