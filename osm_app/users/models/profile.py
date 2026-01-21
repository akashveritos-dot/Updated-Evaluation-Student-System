from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


class profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'  # Useful for reverse access like user.profile
    )

    unique_user_id = models.CharField(max_length=50, unique=True, null=True, blank=True, help_text="Custom Unique ID e.g. FAC-2024-001")

    user_name = models.CharField(max_length=50)
    user_fathers_name = models.CharField(max_length=50)
    user_dob = models.DateField()

    user_pan_no = models.CharField(
        max_length=10,
        unique=True,
        null=True,
        blank=True,
        validators=[RegexValidator(
            regex=r'^[A-Z]{5}[0-9]{4}[A-Z]$',
            message='Enter a valid 10-character PAN number (e.g., ABCDE1234F).'
        )]
    )

    user_designation = models.CharField(max_length=50, null=True, blank=True)
    user_college = models.CharField(max_length=250, null=True, blank=True)
    user_experience = models.CharField(max_length=55, null=True, blank=True)
    user_qualification = models.CharField(max_length=55, null=True, blank=True)
    user_mobile_no = models.CharField(max_length=15, null=True, blank=True)

    user_bank_name = models.CharField(max_length=100)
    user_bank_acnt_no = models.CharField(
        max_length=18,
        validators=[RegexValidator(
            regex=r'^\d{9,18}$',
            message='Enter a valid account number (9 to 18 digits).'
        )]
    )
    user_bank_ifsc_code = models.CharField(
        max_length=11,
        validators=[RegexValidator(
            regex=r'^[A-Z]{4}0[A-Z0-9]{6}$',
            message='Enter a valid 11-character IFSC code (e.g., SBIN0001234).'
        )]
    )
    user_bank_branch_name = models.CharField(max_length=155, null=True, blank=True)

    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user_name if self.user else "No User"
