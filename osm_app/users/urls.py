from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),  # http://localhost:8000/
    path('list/', views.user_list, name='user_list'),
    path('add/', views.register_user, name='add_user'), 
    path('edit/<int:user_id>/', views.edit_user, name='edit_user'),
    path('login/', views.do_login,name="Login"),
    path('logout/', views.do_logout,name="Logout"),
    path('home/', views.home,name="home"),
    path('Profile/', views.profile,name="User_Profile"),
    path('EditProfile/', views.edit_profile_view,name="Edit_Profile"),
    path('ChangePassword/', views.change_user_password,name="Change_Password"),
    path('dashboard/', views.dashboard, name='dashboard'),
    # Add more routes here if needed
]