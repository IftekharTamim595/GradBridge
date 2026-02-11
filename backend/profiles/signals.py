from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import StudentProfile, AlumniProfile

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a profile for the user based on their role.
    """
    if created:
        if instance.is_student:
            StudentProfile.objects.create(user=instance)
        elif instance.is_alumni:
            AlumniProfile.objects.create(user=instance)

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    """
    Ensure the profile is saved when the user is saved.
    """
    if instance.is_student and hasattr(instance, 'student_profile'):
        instance.student_profile.save()
    elif instance.is_alumni and hasattr(instance, 'alumni_profile'):
        instance.alumni_profile.save()
