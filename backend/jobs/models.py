from django.db import models
from profiles.models import Skill, AlumniProfile

class Job(models.Model):
    """
    Job posting model.
    """
    from django.conf import settings
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jobs',
        null=True, blank=True
    )
    posted_by = models.ForeignKey(
        AlumniProfile, 
        on_delete=models.CASCADE, 
        related_name='posted_jobs',
        null=True, blank=True
    )
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField()
    location = models.CharField(max_length=200, blank=True)
    salary_range = models.CharField(max_length=100, blank=True)
    JOB_TYPE_CHOICES = [
        ('Full-time', 'Full-time'),
        ('Internship', 'Internship'),
        ('Entry-level', 'Entry-level'),
        ('Remote', 'Remote'),
    ]
    job_type = models.CharField(max_length=50, choices=JOB_TYPE_CHOICES, default='Full-time')
    apply_link = models.URLField(max_length=500, blank=True)
    
    skills_required = models.ManyToManyField(Skill, related_name='jobs')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.company}"
