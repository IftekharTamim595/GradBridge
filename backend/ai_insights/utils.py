import spacy
import pdfplumber
import re
from collections import Counter

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Warning: spaCy model 'en_core_web_sm' not found. Run 'python -m spacy download en_core_web_sm'")
    nlp = None

ROLE_SKILLS = {
    "backend": ["python", "django", "rest", "api", "postgresql", "docker", "auth", "sql", "git", "linux", "aws", "redis", "celery", "fastapi", "flask", "java", "c++", "node.js", "express"],
    "frontend": ["javascript", "react", "html", "css", "redux", "ui", "ux", "responsive", "typescript", "webpack", "babel", "tailwind", "bootstrap", "vue", "angular"],
    "fullstack": ["python", "django", "javascript", "react", "sql", "git", "docker", "aws", "rest", "api", "typescript", "node.js", "postgresql"],
    "ml_engineer": ["python", "machine learning", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "data analysis", "neural networks", "nlp", "computer vision", "opencv", "matplotlib", "seaborn"],
    "data_scientist": ["python", "r", "pandas", "numpy", "sql", "statistics", "data visualization", "machine learning", "tableau", "power bi"],
}

class ResumeParser:
    @staticmethod
    def extract_text_from_pdf(pdf_file):
        """Extracts text from a uploaded PDF file."""
        text = ""
        try:
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return None
        return text

    @staticmethod
    def normalize_text(text):
        """Cleans and normalizes text."""
        if not text:
            return ""
        text = text.lower()
        text = re.sub(r'\s+', ' ', text) # Replace multiple spaces with single space
        text = re.sub(r'[^\w\s]', '', text) # Remove punctuation (optional, might remove C++)
        # Fix for C++ and C# which might get stripped
        # Actually better to keep some punctuation or handle special cases before stripping
        # For now, simplistic normalization
        return text.strip()

class SkillExtractor:
    @staticmethod
    def extract_skills(text):
        """Extracts skills from text using spaCy and sets."""
        if not nlp or not text:
            return []
        
        doc = nlp(text.lower())
        tokens = [token.text for token in doc if not token.is_stop and not token.is_punct]
        
        # Also handle multi-word skills (like "machine learning") - simplistic approach check logical subsets
        # For this prototype, we'll primarily rely on token matching against our comprehensive lists
        # We can scan the raw text for multi-word skills
        
        extracted_skills = set()
        
        # check for all known skills
        all_known_skills = set(skill for skills in ROLE_SKILLS.values() for skill in skills)
        
        # Check for multi-word skills in raw text
        for skill in all_known_skills:
            if skill in text.lower():
                extracted_skills.add(skill)
                
        return list(extracted_skills)

class ResumeScorer:
    @staticmethod
    def calculate_score(extracted_skills, target_role, text_content):
        """
        Calculates a resume score based on:
        - Skill Match (40%)
        - Project Relevance (30%) - inferred from keywords like 'project', 'built', 'developed' near skills
        - Experience Depth (20%) - inferred from keywords like 'years', 'experience', 'senior', 'lead'
        - Structure (10%) - inferred from section headers
        """
        if not target_role or target_role not in ROLE_SKILLS:
            target_role = "fullstack" # Default fallback
            
        target_skills = set(ROLE_SKILLS[target_role])
        found_skills = set(extracted_skills)
        
        # 1. Skill Match (40%)
        matching_skills = found_skills.intersection(target_skills)
        if not target_skills:
            skill_score = 0
        else:
            skill_score = (len(matching_skills) / len(target_skills)) * 100
            # Cap at 100, but curve it a bit? 
            # If they have 50% of target skills, that's actually pretty good for a score.
            # Let's say 60% match = 100 score for this section?
            # heuristic: min(100, (found / (target_count * 0.5)) * 100)
            skill_score = min(100, (len(matching_skills) / (len(target_skills) * 0.6 + 1)) * 100)
            
        final_skill_score = skill_score * 0.4
        
        # 2. Project Relevance (30%)
        # Look for "project" keywords co-occurring with skills?
        # Or just checking if "projects" section exists
        project_keywords = ["projects", "personal projects", "academic projects", "capstone"]
        has_projects_section = any(keyword in text_content.lower() for keyword in project_keywords)
        
        # Simple heuristic: if projects section + matching skills count > X
        project_score = 0
        if has_projects_section:
            project_score += 50
            if len(matching_skills) > 3:
                project_score += 50
        else:
            # Maybe they didn't label it "Projects" but listed github links?
            if "github.com" in text_content.lower():
                project_score += 40
                
        final_project_score = project_score * 0.3
        
        # 3. Experience Depth (20%)
        # Check for years of experience or "experience" section
        experience_keywords = ["experience", "employment", "work history", "internship"]
        has_exp_section = any(keyword in text_content.lower() for keyword in experience_keywords)
        
        exp_score = 0
        if has_exp_section:
            exp_score = 80 # Just having the section is good
            # Detect "years"
            years = re.findall(r'(\d+)\+?\s*years?', text_content.lower())
            if years:
                exp_score = 100
        elif "intern" in text_content.lower():
            exp_score = 60
            
        final_exp_score = exp_score * 0.2
        
        # 4. Structure (10%)
        # Check for contact info (email/phone)
        structure_score = 0
        if "@" in text_content:
            structure_score += 50
        if len(text_content) > 200: # Not too short
            structure_score += 50
            
        final_structure_score = structure_score * 0.1
        
        total_score = final_skill_score + final_project_score + final_exp_score + final_structure_score
        
        return {
            "total_score": int(total_score),
            "breakdown": {
                "skill_match": int(final_skill_score),
                "project_relevance": int(final_project_score),
                "experience_depth": int(final_exp_score),
                "structure": int(final_structure_score)
            },
            "matching_skills": list(matching_skills),
            "missing_skills": list(target_skills - matching_skills)
        }

class CareerAdvisor:
    @staticmethod
    def generate_insights(score_data, target_role):
        score = score_data["total_score"]
        missing = score_data["missing_skills"]
        breakdown = score_data["breakdown"]
        
        insights = {
            "strengths": [],
            "gaps": [],
            "recommendations": []
        }
        
        # Strengths
        if score > 80:
            insights["strengths"].append("Strong overall profile for this role.")
        if breakdown["skill_match"] > 30: # 40 max
            insights["strengths"].append("Good skill alignment with industry standards.")
            
        # Gaps
        if breakdown["project_relevance"] < 15: # 30 max
            insights["gaps"].append("Projects section seems weak or undefined.")
        if breakdown["experience_depth"] < 10: # 20 max
            insights["gaps"].append("Limited professional or internship experience detected.")
            
        # Recommendations
        if missing:
            top_missing = list(missing)[:3]
            insights["recommendations"].append(f"Consider learning high-impact skills: {', '.join(top_missing)}.")
            
        if breakdown["project_relevance"] < 20:
             insights["recommendations"].append("Build a full-stack project incorporating authentication and a database.")
             
        return insights
