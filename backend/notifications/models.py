from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPES = (
        ('mentorship', 'Mentorship Request'),
        ('message', 'New Message'),
        ('system', 'System Alert'),
    )

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPES)
    message = models.TextField()
    related_link = models.CharField(max_length=255, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.type} for {self.recipient}: {self.message}"
