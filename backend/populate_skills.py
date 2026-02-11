import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from profiles.models import Skill

tech_skills = [
    "Python", "JavaScript", "React", "Django", "Node.js", "PostgreSQL",
    "MongoDB", "AWS", "Docker", "Kubernetes", "Git", "Java", "C++",
    "C#", "Go", "Rust", "Swift", "Kotlin", "Flutter", "TypeScript",
    "HTML", "CSS", "TailwindCSS", "Bootstrap", "Redis", "GraphQL",
    "REST API", "Linux", "DevOps", "CI/CD", "Machine Learning",
    "Data Science", "SQL", "NoSQL", "Firebase", "Azure", "GCP",
    "Terraform", "Ansible", "Jenkins", "Pandas", "NumPy", "TensorFlow",
    "PyTorch", "Scikit-learn", "Keras", "OpenCV", "NLP", "Blockchain",
    "Web3", "Solidity"
]

for name in tech_skills:
    Skill.objects.get_or_create(name=name)

print(f"Populated {len(tech_skills)} skills.")
