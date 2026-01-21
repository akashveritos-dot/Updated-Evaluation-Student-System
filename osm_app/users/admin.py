from django.contrib import admin
from .models import profile, year,menu,roles,roles_menu

# Register your models here.

@admin.register(profile)
class Profile_Admin(admin.ModelAdmin):
    list_display = (
        'user',
        'user_name',
        'user_fathers_name',
        'user_dob',
        'user_pan_no',
        'user_designation',
        'user_mobile_no',
        'user_bank_name',
        'user_bank_acnt_no',
        'user_bank_ifsc_code',
        'created_on',
        'updated_on'
    )
    list_filter = ('user_designation', 'user_college', 'created_on')
    search_fields = ('user_name', 'user_pan_no', 'user_mobile_no', 'user__username')
    ordering = ('-created_on',)

@admin.register(year)
class Year_Admin(admin.ModelAdmin):
    list_display = ('year', 'status', 'added_on', 'updated_on')
    list_filter = ('year','status',)



@admin.register(menu)
class Menu_Admin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'icons', 'urls', 'status', 'added_on', 'updated_on')
    list_filter = ('status', 'parent')
    search_fields = ('name', 'urls', 'icons')

@admin.register(roles)
class Roles_Admin(admin.ModelAdmin):
    list_display = ('name', 'status', 'added_on', 'updated_on')
    list_filter = ('status',)
    search_fields = ('name',)
    ordering = ('-added_on',)

@admin.register(roles_menu)
class RoleMenu_Admin(admin.ModelAdmin):
    list_display = (
        'role', 'menu', 'add_allowed', 'updt_allowed',
        'del_allowed', 'view_allowed', 'menu_order',
        'added_on', 'updated_on'
    )
    list_filter = ('role', 'menu', 'view_allowed')
    search_fields = ('role__name', 'menu__name')



# @admin.register(course)
# class Course_Admin(admin.ModelAdmin):
#     list_display = ('name', 'code', 'status', 'added_on', 'updated_on')
#     list_filter = ('status',)
#     search_fields = ('name', 'code')
# @admin.register(subject)
# class Subject_Admin(admin.ModelAdmin):
#     list_display = ('name', 'code', 'course', 'status', 'added_on', 'updated_on')
#     list_filter = ('status', 'course')
#     search_fields = ('name', 'code', 'course__name')
