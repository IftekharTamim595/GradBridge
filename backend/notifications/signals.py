from django.db.models.signals import post_save
from django.dispatch import receiver
from mentorship.models import MentorshipRequest
from chat.models import Message
from .models import Notification

@receiver(post_save, sender=MentorshipRequest)
def create_mentorship_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            recipient=instance.alumni_profile.user,
            type='mentorship',
            message=f"New mentorship request from {instance.student_profile.user.first_name}",
            related_link='/mentorship/requests' # Placeholder link
        )

@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    if created:
        # Don't notify the sender
        recipient = instance.conversation.participants.exclude(id=instance.sender.id).first()
        if recipient:
            Notification.objects.create(
                recipient=recipient,
                type='message',
                message=f"New message from {instance.sender.first_name}",
                related_link=f'/messages?conversation={instance.conversation.id}'
            )
