from django.urls import path
from . import views

app_name = 'faculty'

urlpatterns = [
    path('demo-evaluation/', views.demo_evaluation_view, name='demo_evaluation'),
    path('dashboard', views.dashboard, name='dashboard'),
    path('sheet/<int:sheet_id>/evaluate/', views.evaluate_sheet, name='evaluate_sheet'),
    path('sheet/<int:sheet_id>/save/', views.save_evaluation, name='save_evaluation'),
    path('evaluate/<int:allocation_id>/', views.evaluation_view, name='evaluation'),
    path('rotate-image', views.rotateImage, name='rotate-image'),
    path('submit', views.submit, name='submit'),
    path('submit-entries', views.submit_entries, name='submit-entries'),
    path('save-realtime-action/', views.save_realtime_action, name='save-realtime-action'),
    path('image/<int:page_id>/', views.serve_blob_image, name='serve_blob_image'),
]