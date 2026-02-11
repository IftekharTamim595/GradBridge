import os
import django
import random
from faker import Faker

# --- CONFIGURATION ---
NUM_STUDENTS = 10  # Change this number to create more/less
NUM_ALUMNI = 5
# ---------------------

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from profiles.models import StudentProfile, AlumniProfile, Skill

fake = Faker()

def create_skills():
    skill_names = ['Python', 'Django', 'React', 'PostgreSQL', 'Machine Learning', 'C++', 'CSS', 'Docker']
    for name in skill_names:
        Skill.objects.get_or_create(name=name, defaults={'category': 'Technical'})
    return Skill.objects.all()

def seed_data():
    skills = create_skills()
    
    # Create Students
    for _ in range(NUM_STUDENTS):
        first = fake.first_name()
        last = fake.last_name()
        email = fake.unique.email()
        
        user = User.objects.create_user(
            username=email.split('@')[0],
            email=email,
            password='password123',
            first_name=first,
            last_name=last,
            role='student'
        )
        
        # Manually create profile if signals aren't set up yet
        StudentProfile.objects.get_or_create(
            user=user,
            defaults={
                'university': 'IIUC',
                'degree': 'B.Sc in CSE',
                'bio': fake.paragraph(nb_sentences=2),
                'city': fake.city(),
                'country': 'Bangladesh'
            }
        )

    # Create Alumni
    for _ in range(NUM_ALUMNI):
        email = fake.unique.email()
        user = User.objects.create_user(
            username=email.split('@')[0],
            email=email,
            password='password123',
            role='alumni'
        )
        
        AlumniProfile.objects.get_or_create(
            user=user,
            defaults={
                'current_company': fake.company(),
                'current_position': 'Software Engineer',
                'years_of_experience': random.randint(1, 10)
            }
        )

if __name__ == "__main__":
    print(f"Seeding {NUM_STUDENTS} students and {NUM_ALUMNI} alumni...")
    seed_data()
    print("Database seeding completed!")