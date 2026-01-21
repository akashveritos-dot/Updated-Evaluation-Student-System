from django.urls import path
from . import views

app_name = 'administration'

urlpatterns = [
    path('', views.admin_dashboard, name='dashboard'),
    path('users/', views.user_management, name='user_management'),
    path('pdfs/', views.pdf_management, name='pdf_management'),
    path('allocations/', views.allocation_management, name='allocation_management'),
    path('logs/', views.action_logs, name='action_logs'),
    path('users/create/', views.create_user, name='create_user'),
    path('papers/', views.manage_papers, name='manage_papers'),
    path('papers/<int:paper_id>/questions/', views.add_questions, name='add_questions'),
    path('sync/', views.sync_data, name='sync_data'),
    path('bundles/', views.bundle_management, name='bundle_management'),
    path('tracking/', views.faculty_tracking, name='faculty_tracking'),
    path('subjects/', views.subject_management, name='subject_management'),
    path('question-papers/', views.question_paper_management, name='question_paper_management'),
    path('explorer/', views.data_explorer, name='data_explorer'),
    path('api/v1/import/', views.api_import_data, name='api_import_data'),
]


