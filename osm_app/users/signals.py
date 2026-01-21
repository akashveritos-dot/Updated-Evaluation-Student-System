from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from users.models import profile
from administration.id_utils import generate_user_id

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Auto-assign unique_user_id to existing profiles.
    Note: Profile must be created manually via admin/registration forms with required fields.
    """
    if hasattr(instance, 'profile') and instance.profile:
        # Only update if unique_user_id is not set
        if not instance.profile.unique_user_id:
            # Determine role based on group
            if instance.is_superuser:
                role = "ADM"
            else:
                role = "FAC" 
                
            unique_id = generate_user_id(role)
            
            # Ensure uniqueness
            while profile.objects.filter(unique_user_id=unique_id).exists():
                unique_id = generate_user_id(role)
                
            instance.profile.unique_user_id = unique_id
            instance.profile.save()
