from django.shortcuts import render, redirect,get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login,logout,update_session_auth_hash
from django.contrib.auth.decorators import login_required
from users.forms import ProfileForm,CreateUserForm,EditUserForm
from django.contrib.auth.forms import PasswordChangeForm
from users.models import profile
from users.menus import get_menu_items
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST


menu_items = get_menu_items()

def index(request):
    if request.method == "POST":
        try:
            username = request.POST['username']
            password = request.POST['password']
            user = authenticate(request, username=username, password=password)
            
            # Check if this is an AJAX request
            is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
            
            if user is not None:
                login(request, user)
                
                # Determine redirect URL based on role
                if user.username == 'demo_evaluator':
                    next_url = '/faculty/demo-evaluation/'
                elif user.is_superuser:
                    next_url = '/administration/'
                elif user.groups.filter(name='Faculty').exists():
                    next_url = '/faculty/dashboard'
                else:
                    next_url = '/users/dashboard'
                
                if is_ajax:
                    # For AJAX requests, return a redirect response
                    from django.http import JsonResponse
                    return JsonResponse({
                        'success': True,
                        'redirect_url': next_url
                    })
                else:
                    return redirect(next_url)
            else:
                if is_ajax:
                    # For AJAX requests, return error response
                    from django.http import JsonResponse
                    return JsonResponse({
                        'success': False,
                        'error': 'Invalid username or password'
                    }, status=400)
                else:
                    return render(request, 'login.html', {'error': 'Invalid credentials'})
        except Exception as e:
            # Log the error for debugging
            import traceback
            traceback.print_exc()
            
            is_ajax = request.headers.get('X-Requested-With') == 'XMLHttpRequest'
            if is_ajax:
                return JsonResponse({
                    'success': False,
                    'error': f'Server error: {str(e)}'
                }, status=500)
            else:
                return render(request, 'login.html', {'error': f'Server error: {str(e)}'})
    return render(request, 'login.html')
def do_login(request):
 return index(request)

def do_logout(request):
 logout(request)
 return index(request)

@login_required
def home(request):
 return render(request, 'home.html',{
    'menu_items': menu_items,
 })

@login_required
def user_list(request):
    users = User.objects.all().order_by('username')
    return render(request, 'users.html', {'menu_items': menu_items,'users': users})

@login_required
def profile(request):
 profile = request.user.profile
 return render(request, 'view_profile.html',{
    'menu_items': menu_items,'profile': profile,
 })



def dashboard(request):
 if not request.user.is_authenticated:
    return redirect('/')

 try:
    if request.user.groups.filter(name='Faculty').exists():
        return redirect('/faculty/dashboard') 

    if not hasattr(request.user, 'profile'):
        return create_profile_view(request)
 
    # Check if tutorial needs to be shown based on user's tutorial status
    tutorial_completed = getattr(request.user.profile, 'tutorial_completed', False)
    tutorial_skipped = getattr(request.user.profile, 'tutorial_skipped', False)
    tutorial_force_restart = getattr(request.user.profile, 'tutorial_force_restart', False)
    tutorial_view_count = getattr(request.user.profile, 'tutorial_view_count', 0)
 
    # Show tutorial if:
    # 1. User hasn't completed it AND hasn't skipped it, OR
    # 2. User has requested a force restart
    show_tutorial = (not tutorial_completed and not tutorial_skipped) or tutorial_force_restart
 
    # Reset force restart flag if tutorial is being shown due to it
    if tutorial_force_restart and show_tutorial:
        request.user.profile.tutorial_force_restart = False
        request.user.profile.save(update_fields=['tutorial_force_restart'])
 
    return render(request, 'dashboard.html', {
        'menu_items': menu_items,
        'show_tutorial': show_tutorial,
        'tutorial_views_remaining': max(0, 3 - tutorial_view_count) if not tutorial_completed else 0
    })
 except Exception as e:
    # Log the error for debugging
    import logging
    logger = logging.getLogger(__name__)
    logger.error(f"Dashboard error for user {request.user.username}: {str(e)}")
    
    # Return a simple dashboard without tutorial features if there's an error
    return render(request, 'dashboard.html', {
        'menu_items': menu_items,
        'show_tutorial': False,
        'tutorial_views_remaining': 0,
        'error_message': 'Some features may be unavailable. Please contact support if the issue persists.'
    })

@login_required
def create_profile_view(request):
    # Prevent access if profile already exists
    if hasattr(request.user, 'profile'):
        return redirect('dashboard')  # Redirect if already created

    if request.method == 'POST':
        form = ProfileForm(request.POST)
        if form.is_valid():
            user_profile = form.save(commit=False)
            user_profile.user = request.user  # Link profile to logged-in user
            user_profile.save()
            messages.success(request, 'Your Profile was successfully Created!')
            return redirect('dashboard')  # Go to dashboard after saving
    else:
        form = ProfileForm()

    return render(request, 'base_form.html', {'menu_items': menu_items,'form': form,'form_title': 'Create Profile'})

@login_required
def register_user(request):
    if request.method == 'POST':
        form = CreateUserForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.save()

            group = form.cleaned_data.get('group')
            if group:
                user.groups.clear()
                user.groups.add(group)
            messages.success(request, 'User was successfully Added!')
            return redirect('user_list')   # or any page you prefer
    else:
        form = CreateUserForm()
    return render(request, 'base_form.html', {'menu_items': menu_items,'form': form,'form_title': 'Create User'})

@login_required
def edit_user(request, user_id):
    user = get_object_or_404(User, pk=user_id)

    if request.method == 'POST':
        form = EditUserForm(request.POST, instance=user)
        if form.is_valid():
            user = form.save(commit=False)
            user.save()

            # Handle group assignment
            group = form.cleaned_data.get('group')
            if group:
                user.groups.clear()
                user.groups.add(group)

            messages.success(request, 'User was successfully updated!')
            return redirect('user_list')
    else:
        initial_group = user.groups.first()  # pre-fill group field
        form = EditUserForm(instance=user, initial={'group': initial_group})

    return render(request, 'base_form.html', {
        'menu_items': menu_items,
        'form': form,
        'form_title': f"Edit User - {user.username}"
    })

@login_required
def edit_profile_view(request):
    # Prevent access if profile already exists
 if hasattr(request.user, 'profile'):
    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=request.user.profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your Profile was successfully Updated!')
            return redirect('User_Profile') # Go to Profile after saving
    else:
        form = ProfileForm(instance=request.user.profile)

 return render(request, 'base_form.html', {'menu_items': menu_items,'form': form,'form_title': 'Update Profile'})

@login_required
def change_user_password(request):
 if request.method == 'POST':
        form = PasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Keeps the user logged in
            messages.success(request, 'Your password was successfully updated!')
            return redirect('home')
        else:
            messages.error(request, 'Please correct the errors below.')
 else:
        form = PasswordChangeForm(request.user)
 return render(request, 'base_form.html', {'menu_items': menu_items,'form': form,'form_title': 'Change Password'})

@login_required
def user_group_list(request):
    users = User.objects.all()  
    form = UserGroupForm()
    return render(request, 'view_groups.html', {'menu_items': menu_items,'form': form,'form_title': 'Add UserGroup','users': users})
@login_required
def user_group_edit(request, user_id):
    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        form = UserGroupForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            messages.success(request, f"Groups updated for {user.username}")
            return redirect('user_group_list')
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = UserGroupForm(instance=user)

    return render(request, 'base_form.html', {
        'form': form,
        'form_title': 'Edit User Groups',
    })
