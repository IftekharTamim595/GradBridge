"""
Profile models for Students and Alumni.
"""
from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator


class Skill(models.Model):
    """
    Tag-based skill model.
    """
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, blank=True)  # e.g., 'programming', 'design', 'soft-skills'
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'skills'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
        ]
        ordering = ['name']
    
    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    """
    Student profile with education, skills, and resume.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    
    # Education
    university = models.CharField(max_length=200, blank=True)
    degree = models.CharField(max_length=100, blank=True)  # e.g., 'BSc Computer Science'
    batch = models.CharField(max_length=20, blank=True)  # e.g., '2024', '2025'
    gpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    
    # Skills
    skills = models.ManyToManyField(Skill, related_name='student_profiles', blank=True)
    
    # Resume
    resume = models.FileField(
        upload_to='resumes/',
        null=True,
        blank=True,
        validators=[FileExtensionValidator(allowed_extensions=['pdf'])]
    )
    
    # Profile metrics
    profile_strength = models.IntegerField(default=0)  # 0-100 score
    profile_completion_percentage = models.IntegerField(default=0)
    
    # Additional info
    bio = models.TextField(blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    
    # Profile visibility
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='public')
    
    # Location
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Hiring availability
    available_for_hire = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'student_profiles'
        indexes = [
            models.Index(fields=['batch']),
            models.Index(fields=['graduation_year']),
            models.Index(fields=['profile_strength']),
            models.Index(fields=['visibility']),
            models.Index(fields=['available_for_hire']),
            models.Index(fields=['city', 'country']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - Student Profile"
    
    def calculate_profile_strength(self):
        """
        Calculate profile strength based on completeness.
        """
        score = 0
        max_score = 100
        
        # Education (30 points)
        if self.university:
            score += 10
        if self.degree:
            score += 10
        if self.graduation_year:
            score += 10
        
        # Skills (20 points)
        if self.skills.exists():
            score += min(20, self.skills.count() * 2)
        
        # Resume (20 points)
        if self.resume:
            score += 20
        
        # Projects (20 points) - calculated from projects app
        from projects.models import Project
        project_count = Project.objects.filter(student_profile=self).count()
        if project_count > 0:
            score += min(20, project_count * 5)
        
        # Additional info (10 points)
        if self.bio:
            score += 5
        if self.linkedin_url or self.github_url or self.portfolio_url:
            score += 5
        
        self.profile_strength = min(100, score)
        self.save()
        return self.profile_strength


class AlumniProfile(models.Model):
    """
    Alumni profile with professional information.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alumni_profile')
    
    # Professional info
    current_company = models.CharField(max_length=200, blank=True)
    current_position = models.CharField(max_length=200, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    years_of_experience = models.IntegerField(null=True, blank=True)
    
    # Education (alumni's education history)
    university = models.CharField(max_length=200, blank=True)
    degree = models.CharField(max_length=100, blank=True)
    graduation_year = models.IntegerField(null=True, blank=True)
    batch = models.CharField(max_length=20, blank=True)
    
    # Skills and expertise
    skills = models.ManyToManyField(Skill, related_name='alumni_profiles', blank=True)
    expertise_areas = models.TextField(blank=True)  # Free-form text for areas of expertise
    
    # Availability
    available_for_mentorship = models.BooleanField(default=True)
    available_for_referrals = models.BooleanField(default=True)
    
    # Contact and links
    linkedin_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    
    # Profile visibility
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]
    visibility = models.CharField(max_length=10, choices=VISIBILITY_CHOICES, default='public')
    
    # Location
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Analytics (calculated fields)
    students_mentored_count = models.IntegerField(default=0)
    referrals_made_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'alumni_profiles'
        indexes = [
            models.Index(fields=['current_company']),
            models.Index(fields=['industry']),
            models.Index(fields=['available_for_mentorship']),
            models.Index(fields=['available_for_referrals']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - Alumni Profile"


class SkillGap(models.Model):
    """
    Skill gap suggestions for students.
    """
    student_profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='skill_gaps')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    suggested_by = models.CharField(max_length=50, default='system')  # 'system' or 'alumni'
    priority = models.IntegerField(default=1)  # 1-5, higher is more important
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'skill_gaps'
        unique_together = ['student_profile', 'skill']
        indexes = [
            models.Index(fields=['student_profile', 'priority']),
        ]
    
    def __str__(self):
        return f"{self.student_profile.user.email} - {self.skill.name}"


class Certificate(models.Model):
    """
    Student certifications.
    """
    student_profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='certificates')
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiration_date = models.DateField(null=True, blank=True)
    credential_id = models.CharField(max_length=100, blank=True)
    credential_url = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'certificates'
        ordering = ['-issue_date']
        
    def __str__(self):
        return f"{self.student_profile.user.email} - {self.name}"
