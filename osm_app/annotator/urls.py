from django.urls import path
from . import views

urlpatterns = [
    path('', views.upload_pdf, name='upload_pdf'),
    path('annotate/<int:pdf_id>/', views.annotate_pdf, name='annotate_pdf'),
    path('save-annotation/', views.save_annotation, name='save_annotation'),
    path('load-annotation/', views.load_annotation, name='load_annotation'),
    path('submit/', views.submit_evaluation, name='submit_evaluation'),
]
