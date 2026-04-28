import requests
import json
from django.conf import settings
from profiles.models import StudentProfile
from .models import Job

def get_job_recommendations(student_profile):
    """
    Use OpenRouter to find the best matching jobs for a student.
    """
    api_key = settings.OPENROUTER_API_KEY if hasattr(settings, 'OPENROUTER_API_KEY') else os.getenv('OPENROUTER_API_KEY')
    if not api_key:
        return []

    # Get all active jobs
    jobs = Job.objects.filter(is_active=True)
    if not jobs.exists():
        return []

    # Prepare data for AI
    student_data = {
        "skills": [s.name for s in student_profile.skills.all()],
        "degree": student_profile.degree,
        "bio": student_profile.bio
    }
    
    jobs_data = [
        {
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "skills": [s.name for s in job.skills_required.all()],
            "description": job.description[:200]
        }
        for job in jobs
    ]

    prompt = f"""
    Acting as a career advisor, match the following student profile with the most relevant job postings.
    Student Profile: {json.dumps(student_data)}
    Available Jobs: {json.dumps(jobs_data)}
    
    Return ONLY a JSON array of job IDs that match best, sorted by relevance. Example: [1, 5, 2]
    """

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "openai/gpt-3.5-turbo", # or a cheaper model
                "messages": [{"role": "user", "content": prompt}]
            })
        )
        
        result = response.json()
        content = result['choices'][0]['message']['content']
        job_ids = json.loads(content)
        return job_ids
    except Exception as e:
        print(f"AI Matching Error: {e}")
        return []
