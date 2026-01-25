"""
Mentorship and referral models.
"""
from django.db import models
from django.conf import settings
from profiles.models import StudentProfile, AlumniProfile


class MentorshipRequest(models.Model):
    """
    Mentorship request from student to alumni.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='mentorship_requests'
    )
    alumni_profile = models.ForeignKey(
        AlumniProfile,
        on_delete=models.CASCADE,
        related_name='mentorship_requests'
    )
    
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'mentorship_requests'
        unique_together = ['student_profile', 'alumni_profile']
        indexes = [
            models.Index(fields=['student_profile', 'status']),
            models.Index(fields=['alumni_profile', 'status']),
            models.Index(fields=['status']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student_profile.user.email} -> {self.alumni_profile.user.email} ({self.status})"


class ReferralRequest(models.Model):
    """
    Referral request from student to alumni.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='referral_requests'
    )
    alumni_profile = models.ForeignKey(
        AlumniProfile,
        on_delete=models.CASCADE,
        related_name='referral_requests'
    )
    
    target_company = models.CharField(max_length=200, blank=True)
    target_role = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Referral outcome
    recommendation_letter = models.TextField(blank=True)  # AI-generated, editable
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'referral_requests'
        indexes = [
            models.Index(fields=['student_profile', 'status']),
            models.Index(fields=['alumni_profile', 'status']),
            models.Index(fields=['status']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student_profile.user.email} -> {self.alumni_profile.user.email} ({self.status})"


class Message(models.Model):
    """
    Chat messages between students and alumni.
    """
    mentorship_request = models.ForeignKey(
        MentorshipRequest,
        on_delete=models.CASCADE,
        related_name='messages',
        null=True,
        blank=True
    )
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_messages')
    
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'messages'
        indexes = [
            models.Index(fields=['sender', 'receiver']),
            models.Index(fields=['mentorship_request']),
            models.Index(fields=['is_read', 'created_at']),
        ]
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.sender.email} -> {self.receiver.email}"
