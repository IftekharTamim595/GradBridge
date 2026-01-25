"""
ML/AI services for resume parsing, skill extraction, and matching.
"""
import re
import PyPDF2
from io import BytesIO
from typing import List, Dict, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class ResumeParserService:
    """
    Service for parsing resumes and extracting information.
    """
    
    def __init__(self):
        # Common skill keywords (can be expanded)
        self.skill_keywords = {
            'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'],
            'web': ['html', 'css', 'react', 'angular', 'vue', 'django', 'flask', 'node', 'express', 'spring'],
            'database': ['sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'oracle'],
            'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'],
            'data': ['pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'spark'],
            'tools': ['git', 'jenkins', 'ci/cd', 'linux', 'bash', 'agile', 'scrum'],
        }
    
    def extract_text_from_pdf(self, pdf_file) -> str:
        """
        Extract text from PDF file.
        """
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ''
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text.lower()
        except Exception as e:
            return ''
    
    def extract_skills(self, resume_text: str) -> List[str]:
        """
        Extract skills from resume text using keyword matching.
        """
        found_skills = []
        
        # Flatten skill keywords
        all_skills = []
        for category, skills in self.skill_keywords.items():
            all_skills.extend(skills)
        
        # Simple keyword matching
        for skill in all_skills:
            if skill.lower() in resume_text:
                found_skills.append(skill)
        
        return list(set(found_skills))  # Remove duplicates
    
    def calculate_resume_score(self, resume_text: str, target_skills: List[str]) -> float:
        """
        Calculate resume score based on keyword relevance.
        """
        if not target_skills:
            return 0.0
        
        # Count how many target skills are found in resume
        found_count = 0
        resume_lower = resume_text.lower()
        
        for skill in target_skills:
            if skill.lower() in resume_lower:
                found_count += 1
        
        # Score as percentage
        score = (found_count / len(target_skills)) * 100
        return min(100.0, score)


class ProjectRoleMatcherService:
    """
    Service for matching student projects to job roles.
    """
    
    def __init__(self):
        # Role-specific keywords
        self.role_keywords = {
            'software_engineer': ['software', 'development', 'programming', 'coding', 'algorithm', 'data structure'],
            'web_developer': ['web', 'frontend', 'backend', 'fullstack', 'html', 'css', 'javascript', 'react'],
            'data_scientist': ['data', 'machine learning', 'ai', 'analytics', 'statistics', 'pandas', 'numpy'],
            'devops_engineer': ['devops', 'ci/cd', 'docker', 'kubernetes', 'aws', 'cloud', 'infrastructure'],
            'mobile_developer': ['mobile', 'android', 'ios', 'react native', 'flutter', 'swift', 'kotlin'],
        }
    
    def match_projects_to_role(self, projects: List[Dict], target_role: str) -> List[Dict]:
        """
        Match projects to a target role using TF-IDF similarity.
        """
        if not projects:
            return []
        
        # Get role keywords
        role_keywords = self.role_keywords.get(target_role.lower().replace(' ', '_'), [])
        if not role_keywords:
            return projects  # Return all if role not found
        
        # Prepare documents
        documents = []
        for project in projects:
            doc = f"{project.get('title', '')} {project.get('description', '')} {project.get('tech_stack', '')}"
            documents.append(doc.lower())
        
        role_doc = ' '.join(role_keywords).lower()
        documents.append(role_doc)
        
        # Calculate TF-IDF
        try:
            vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(documents)
            
            # Calculate similarity
            role_vector = tfidf_matrix[-1]
            project_vectors = tfidf_matrix[:-1]
            
            similarities = cosine_similarity(role_vector, project_vectors)[0]
            
            # Add scores to projects
            scored_projects = []
            for i, project in enumerate(projects):
                project['match_score'] = float(similarities[i])
                scored_projects.append(project)
            
            # Sort by match score
            scored_projects.sort(key=lambda x: x['match_score'], reverse=True)
            
            return scored_projects
        except Exception:
            # Fallback: return projects as-is
            return projects


class RecommendationLetterService:
    """
    Service for generating recommendation letters.
    """
    
    def generate_letter(self, student_profile, target_role: str = '', target_company: str = '') -> str:
        """
        Generate a recommendation letter template with AI-assisted content.
        """
        user = student_profile.user
        projects = student_profile.projects.all()[:3]  # Top 3 projects
        
        # Build letter
        letter_parts = []
        
        # Header
        letter_parts.append(f"To Whom It May Concern,\n\n")
        letter_parts.append(f"I am writing to recommend {user.get_full_name() or user.email} for the {target_role or 'position'} at {target_company or 'your organization'}.\n\n")
        
        # Education
        if student_profile.university and student_profile.degree:
            letter_parts.append(f"{user.get_full_name() or 'The candidate'} is a {student_profile.degree} student at {student_profile.university}.")
            if student_profile.gpa:
                letter_parts.append(f" They have maintained a GPA of {student_profile.gpa}.")
            letter_parts.append("\n\n")
        
        # Skills
        skills = student_profile.skills.all()[:5]
        if skills:
            skill_names = ', '.join([skill.name for skill in skills])
            letter_parts.append(f"In terms of technical skills, {user.first_name or 'the candidate'} demonstrates proficiency in {skill_names}.\n\n")
        
        # Projects
        if projects:
            letter_parts.append("Notable projects include:\n")
            for project in projects:
                letter_parts.append(f"- {project.title}: {project.description[:100]}...\n")
            letter_parts.append("\n")
        
        # Closing
        letter_parts.append(f"Based on my interaction with {user.first_name or 'the candidate'}, I believe they would be a valuable addition to your team.\n\n")
        letter_parts.append("Sincerely,\n[Your Name]")
        
        return ''.join(letter_parts)


class StudentSummaryService:
    """
    Service for generating AI-assisted student summaries for alumni.
    """
    
    def generate_summary(self, student_profile) -> Dict:
        """
        Generate a concise summary of a student for alumni review.
        """
        user = student_profile.user
        projects = student_profile.projects.all()
        skills = student_profile.skills.all()
        
        summary = {
            'name': user.get_full_name() or user.email,
            'education': f"{student_profile.degree} at {student_profile.university}" if student_profile.degree and student_profile.university else "Education not specified",
            'batch': student_profile.batch or "Not specified",
            'profile_strength': student_profile.profile_strength,
            'skills': [skill.name for skill in skills[:10]],
            'project_count': projects.count(),
            'top_projects': [
                {
                    'title': p.title,
                    'tech_stack': p.tech_stack,
                }
                for p in projects[:3]
            ],
            'resume_uploaded': bool(student_profile.resume),
        }
        
        return summary
