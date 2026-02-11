from django.core.management.base import BaseCommand
from profiles.models import Skill

class Command(BaseCommand):
    help = 'Populate predefined skills'

    def handle(self, *args, **kwargs):
        skills = [
            # Frontend
            ('React', 'Frontend'), ('Vue.js', 'Frontend'), ('Angular', 'Frontend'),
            ('Svelte', 'Frontend'), ('HTML5', 'Frontend'), ('CSS3', 'Frontend'),
            ('Tailwind CSS', 'Frontend'), ('Bootstrap', 'Frontend'), ('TypeScript', 'Frontend'),
            ('JavaScript', 'Frontend'), ('Next.js', 'Frontend'), ('Nuxt.js', 'Frontend'),
            
            # Backend
            ('Python', 'Backend'), ('Django', 'Backend'), ('Flask', 'Backend'),
            ('FastAPI', 'Backend'), ('Node.js', 'Backend'), ('Express.js', 'Backend'),
            ('Java', 'Backend'), ('Spring Boot', 'Backend'), ('Go', 'Backend'),
            ('Rust', 'Backend'), ('Ruby', 'Backend'), ('Ruby on Rails', 'Backend'),
            ('PHP', 'Backend'), ('Laravel', 'Backend'), ('C#', 'Backend'), ('.NET', 'Backend'),
            
            # Database
            ('PostgreSQL', 'Database'), ('MySQL', 'Database'), ('MongoDB', 'Database'),
            ('Redis', 'Database'), ('SQLite', 'Database'), ('Oracle', 'Database'),
            ('Cassandra', 'Database'), ('DynamoDB', 'Database'),
            
            # DevOps & Cloud
            ('AWS', 'DevOps'), ('Google Cloud', 'DevOps'), ('Azure', 'DevOps'),
            ('Docker', 'DevOps'), ('Kubernetes', 'DevOps'), ('Jenkins', 'DevOps'),
            ('GitHub Actions', 'DevOps'), ('Terraform', 'DevOps'), ('Ansible', 'DevOps'),
            ('Linux', 'DevOps'), ('Nginx', 'DevOps'),
            
            # AI/ML
            ('Machine Learning', 'AI/ML'), ('Deep Learning', 'AI/ML'), ('TensorFlow', 'AI/ML'),
            ('PyTorch', 'AI/ML'), ('Scikit-Learn', 'AI/ML'), ('Pandas', 'AI/ML'),
            ('NumPy', 'AI/ML'), ('NLP', 'AI/ML'), ('Computer Vision', 'AI/ML'),
            ('Data Science', 'AI/ML'),
            
            # Mobile
            ('React Native', 'Mobile'), ('Flutter', 'Mobile'), ('iOS', 'Mobile'),
            ('Android', 'Mobile'), ('Swift', 'Mobile'), ('Kotlin', 'Mobile'),
            
            # Design
            ('Figma', 'Design'), ('Adobe XD', 'Design'), ('UI/UX', 'Design'),
            
            # Other
            ('Git', 'Tools'), ('Agile', 'Methodology'), ('Scrum', 'Methodology'),
            ('GraphQL', 'API'), ('REST API', 'API')
        ]

        count = 0
        for name, category in skills:
            skill, created = Skill.objects.get_or_create(
                name=name,
                defaults={'category': category}
            )
            if created:
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully populated {count} new skills'))
