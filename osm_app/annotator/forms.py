from django import forms

class UploadPDFForm(forms.Form):
    file = forms.FileField(label='Select a PDF file')
    password = forms.CharField(widget=forms.PasswordInput, required=False, label='PDF Password (if any)')