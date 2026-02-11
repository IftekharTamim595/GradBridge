import os
import sys
import django

# Add the project directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from ai_insights.utils import SkillExtractor, ResumeScorer, CareerAdvisor

def test_resume_logic():
    print("Testing Resume Logic...")
    
    # Sample Text (simulated extracted text)
    sample_text = """
    John Doe
    Software Engineer
    
    Experience:
    Senior Backend Developer at Tech Corp (3 years)
    - Built REST APIs using Django and Python.
    - Managed PostgreSQL databases.
    - Deployed using Docker and AWS.
    
    Skills:
    Python, Django, REST API, PostgreSQL, Docker, AWS, Git, Linux.
    
    Projects:
    - E-commerce Platform: Built a full-stack app using React and Django.
    """
    
    print(f"\nSample Text:\n{sample_text}")
    
    # 1. Test Skill Extraction
    print("\n1. Testing Skill Extraction...")
    skills = SkillExtractor.extract_skills(sample_text)
    print(f"Extracted Skills: {skills}")
    
    # 2. Test Scoring (Target: Backend)
    print("\n2. Testing Scoring (Target: Backend)...")
    score_data = ResumeScorer.calculate_score(skills, "backend", sample_text)
    print(f"Score Data: {score_data}")
    
    # 3. Test Insights
    print("\n3. Testing Insights...")
    insights = CareerAdvisor.generate_insights(score_data, "backend")
    print(f"Insights: {insights}")
    
    # Assertions
    lowercase_skills = [s.lower() for s in skills]
    if "django" in lowercase_skills:
        print("✅ Django found in skills")
    else:
        print("❌ Django NOT found in skills")
        
    if score_data["total_score"] > 50:
         print("✅ Score calculation seems reasonable (> 50)")
    else:
         print(f"❌ Score seems low: {score_data['total_score']}")

if __name__ == "__main__":
    test_resume_logic()
