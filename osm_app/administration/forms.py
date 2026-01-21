from django import forms
from django.contrib.auth.models import User, Group
from .models import QuestionPaper, Question

class UserRegistrationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    role = forms.ChoiceField(choices=[('Student', 'Student'), ('Faculty', 'Faculty')])
    is_active = forms.BooleanField(required=False, initial=False, help_text="Uncheck to disable login until approved.")

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'is_active']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
            group_name = self.cleaned_data['role']
            group, _ = Group.objects.get_or_create(name=group_name)
            user.groups.add(group)
            
            # Auto-generate unique_user_id if profile exists
            if hasattr(user, 'profile') and user.profile:
                from administration.id_utils import generate_user_id
                from users.models import profile
                
                # Determine role prefix
                role_prefix = "FAC" if group_name == "Faculty" else "STU"
                unique_id = generate_user_id(role_prefix)
                
                # Ensure uniqueness
                while profile.objects.filter(unique_user_id=unique_id).exists():
                    unique_id = generate_user_id(role_prefix)
                
                user.profile.unique_user_id = unique_id
                user.profile.save()
        return user

class BundleUploadForm(forms.Form):
    name = forms.CharField(label='Bundle Name', max_length=255, help_text="e.g. Mid-Term Batch A")
    subject = forms.ModelChoiceField(queryset=None, label='Select Subject', help_text="Choose the subject for this bundle")
    zip_file = forms.FileField(label='Select ZIP File', help_text="Upload a ZIP file containing answer sheet PDFs.")
    password = forms.CharField(widget=forms.PasswordInput, required=False, label='Default PDF Password (if any)')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .models import Subject
        self.fields['subject'].queryset = Subject.objects.all()

class SubjectForm(forms.Form):
    name = forms.CharField(label='Subject Name', max_length=255, help_text="e.g. Mathematics")
    code = forms.CharField(label='Subject Code', max_length=20, required=False, help_text="e.g. MATH101")

class QuestionPaperForm(forms.Form):
    title = forms.CharField(label='Paper Title', max_length=255, help_text="e.g. Mid-Term Mathematics")
    subject = forms.ModelChoiceField(queryset=None, label='Select Subject')
    file = forms.FileField(label='Upload Question Paper', help_text="PDF, DOC, or DOCX file")
    total_marks = forms.IntegerField(label='Total Marks', min_value=0, help_text="Total marks for this paper")
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .models import Subject
        self.fields['subject'].queryset = Subject.objects.all()

class QuestionForm(forms.Form):
    description = forms.CharField(label='Question Description', widget=forms.Textarea(attrs={'rows': 3}), help_text="Enter the question text")
    max_marks = forms.DecimalField(label='Maximum Marks', max_digits=5, decimal_places=2, min_value=0)

class AllocationForm(forms.Form):
    faculty = forms.ModelChoiceField(
        queryset=User.objects.filter(groups__name='Faculty'), 
        label="Select Faculty",
        help_text="Select Faculty by Name/Unique ID"
    )
    bundle = forms.ModelChoiceField(
        queryset=None,
        label='Select Bundle',
        help_text="Choose bundle to assign from"
    )
    question_paper = forms.ModelChoiceField(
        queryset=None,
        label='Select Question Paper (Optional)',
        required=False,
        help_text="Link a question paper to this assignment"
    )
    num_sheets = forms.IntegerField(
        label='Number of Sheets',
        min_value=1,
        help_text="How many sheets to assign"
    )
    deadline = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'type': 'date'}),
        label='Deadline (Optional)'
    )
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from .models import Bundle, QuestionPaper
        from django.contrib.auth.models import User
        self.fields['faculty'].queryset = User.objects.filter(groups__name='Faculty')
        self.fields['bundle'].queryset = Bundle.objects.all()
        self.fields['question_paper'].queryset = QuestionPaper.objects.all()
