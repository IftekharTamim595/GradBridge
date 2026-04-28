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
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Hiring availability
    available_for_hire = models.BooleanField(default=False)
    
    # Profile Scoring Breakdown
    profile_breakdown = models.JSONField(default=dict, blank=True)
    
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
        Calculate profile strength based on strict 100-point gamification system.
        """
        breakdown = {
            'education': 0,
            'cv': 0,
            'skills': 0,
            'projects': 0,
            'experience': 0,
            'profile': 0,
            'community': 0
        }
        missing = []
        
        # 1. Education (Max 10)
        if self.university:
            breakdown['education'] += 5
        else:
            missing.append("Add university to gain +5 points")
            
        if self.degree:
            breakdown['education'] += 3
        else:
            missing.append("Add degree/department (+3 points)")
            
        if self.graduation_year:
            breakdown['education'] += 2
        else:
            missing.append("Add graduation year (+2 points)")
            
        # 2. CV / Resume (Max 20)
        has_skills = self.skills.exists()
        from projects.models import Project
        has_projects = Project.objects.filter(student_profile=self).exists()
        
        if self.resume:
            breakdown['cv'] += 10
            # Simulating parsing success based on profile completion
            if has_skills:
                breakdown['cv'] += 5
            else:
                missing.append("Add skills to improve resume parsing (+5 points)")
            if has_projects:
                breakdown['cv'] += 5
            else:
                missing.append("Add projects for structured sections (+5 points)")
        else:
            missing.append("Upload CV/Resume to gain +10 points")
            
        # 3. Skills (Max 20)
        skill_count = self.skills.count()
        if skill_count >= 10:
            breakdown['skills'] += 15
        elif skill_count >= 5:
            breakdown['skills'] += 10
            missing.append("Add 10+ skills (+5 points)")
        elif skill_count > 0:
            breakdown['skills'] += 5
            missing.append(f"Add at least 5 skills (+10 points)")
        else:
            missing.append("Add at least 5 skills to gain +10 points")
            
        categories = set(self.skills.values_list('category', flat=True).exclude(category=''))
        if len(categories) >= 2:
            breakdown['skills'] += 5
        elif skill_count > 0:
            missing.append("Add skills from multiple categories (+5 points)")
            
        # 4. Projects (Max 20)
        projects = Project.objects.filter(student_profile=self)
        proj_count = projects.count()
        if proj_count >= 2:
            breakdown['projects'] += 10
        elif proj_count == 1:
            breakdown['projects'] += 5
            missing.append("Add 2+ projects (+5 points)")
        else:
            missing.append("Add 1 project to gain +5 points")
            
        if proj_count > 0:
            has_desc = any(p.description for p in projects)
            if has_desc:
                breakdown['projects'] += 5
            else:
                missing.append("Add description to projects (+5 points)")
                
            has_links = any(p.github_link or p.live_link for p in projects)
            if has_links:
                breakdown['projects'] += 5
            else:
                missing.append("Add GitHub/demo links to projects (+5 points)")
            
        # 5. Experience (Max 10)
        experiences = self.experiences.all()
        has_internship = any(e.exp_type in ['internship', 'job'] for e in experiences)
        has_leadership = any(e.exp_type in ['teaching', 'volunteering', 'leadership'] for e in experiences)
        
        if has_internship:
            breakdown['experience'] += 5
        else:
            missing.append("Add internship/job experience (+5 points)")
            
        if has_leadership:
            breakdown['experience'] += 5
        else:
            missing.append("Add teaching/leadership experience (+5 points)")
            
        # 6. Profile Completion (Max 10)
        if self.user.profile_photo:
            breakdown['profile'] += 2
        else:
            missing.append("Upload profile picture (+2 points)")
            
        if self.bio:
            breakdown['profile'] += 3
        else:
            missing.append("Complete profile bio (+3 points)")
            
        if self.visibility == 'public':
            breakdown['profile'] += 2
        else:
            missing.append("Make profile public (+2 points)")
            
        if self.user.last_login:
            breakdown['profile'] += 3
            
        # 7. Community (Max 10)
        try:
            from community.models import Post
            post_count = Post.objects.filter(author=self.user).count()
            if post_count > 0:
                breakdown['community'] += 3
            else:
                missing.append("Create a community post (+3 points)")
                
            # Simulate comments/interactions for now
            if post_count >= 2:
                breakdown['community'] += 3
            else:
                missing.append("Engage with community comments (+3 points)")
                
            from mentorship.models import MentorshipRequest
            mentor_reqs = MentorshipRequest.objects.filter(student_profile=self).count()
            if mentor_reqs > 0:
                breakdown['community'] += 4
            else:
                missing.append("Request alumni mentorship (+4 points)")
        except ImportError:
            pass
            
        total_score = sum(breakdown.values())
        
        result = {
            "total_score": min(100, total_score),
            "breakdown": breakdown,
            "missing": missing
        }
        
        self.profile_strength = result['total_score']
        self.profile_breakdown = result
        self.save()
        return result

class Experience(models.Model):
    """
    Student experience (internships, volunteering, etc).
    """
    EXP_TYPE_CHOICES = [
        ('internship', 'Internship'),
        ('job', 'Full-time Job'),
        ('part_time', 'Part-time Job'),
        ('teaching', 'Teaching/TA'),
        ('volunteering', 'Volunteering'),
        ('leadership', 'Leadership/Club'),
    ]
    student_profile = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='experiences')
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    exp_type = models.CharField(max_length=50, choices=EXP_TYPE_CHOICES, default='internship')
    location = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'experiences'
        ordering = ['-start_date']
        
    def __str__(self):
        return f"{self.student_profile.user.email} - {self.title} at {self.company}"


class AlumniProfile(models.Model):
    """
    Alumni profile with professional information.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alumni_profile')
    
    # Professional info
    profile_picture = models.ImageField(upload_to="profiles/", null=True, blank=True)
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
