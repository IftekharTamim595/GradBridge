from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.conf import settings
from .utils import ResumeParser, SkillExtractor, ResumeScorer, CareerAdvisor, ROLE_SKILLS
from .openrouter import call_openrouter
from profiles.models import StudentProfile
import os

import json
import logging

logger = logging.getLogger(__name__)

class AnalyzeResumeView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('resume')
        target_role = request.data.get('role', 'fullstack')
        
        if not file_obj:
            return Response({'error': 'No resume file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # 1. Text Extraction
            text = ResumeParser.extract_text_from_pdf(file_obj)
            if not text:
                logger.error("Failed to extract text from PDF")
                return Response({'error': 'Could not extract text from PDF. Ensure it is a valid PDF file.'}, status=status.HTTP_400_BAD_REQUEST)
            
            normalized_text = ResumeParser.normalize_text(text)
            logger.info(f"--- EXTRACTED RESUME TEXT (First 500 chars) ---\n{normalized_text[:500]}...")

            # 2. Skill Extraction (Local)
            skills = SkillExtractor.extract_skills(normalized_text)
            
            # 3. AI Analysis Prompt
            prompt = f"""
            Analyze this resume for a '{target_role}' position.
            Extracted Skills: {', '.join(skills)}
            Resume Content: {normalized_text[:4000]}

            Return ONLY a valid JSON object with the following structure:
            {{
                "score": number (0-100),
                "breakdown": {{
                    "skill_match": number (0-40),
                    "project_relevance": number (0-30),
                    "experience_depth": number (0-20),
                    "structure": number (0-10)
                }},
                "strengths": string[],
                "weaknesses": string[],
                "suggestions": string[]
            }}
            Rules:
            - No markdown formatting
            - No conversational text
            - Valid JSON only
            """

            # 4. Call AI Service
            raw_ai_response = call_openrouter(prompt, system_prompt="You are a professional resume auditor that returns strict JSON.")
            logger.info(f"--- RAW AI RESPONSE ---\n{raw_ai_response}")

            # 5. Safe JSON Parsing
            try:
                # Remove markdown code blocks if present
                clean_json = raw_ai_response.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:-3].strip()
                elif clean_json.startswith("```"):
                    clean_json = clean_json[3:-3].strip()
                
                ai_data = json.loads(clean_json)
                logger.info(f"--- PARSED AI DATA ---\n{json.dumps(ai_data, indent=2)}")
            except (ValueError, json.JSONDecodeError) as e:
                logger.error(f"JSON Parsing Error: {str(e)}")
                return Response({'error': 'AI generated an invalid response format. Please try again.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # 6. Final Data Assembly
            response_data = {
                "score": ai_data.get("score", 0),
                "breakdown": ai_data.get("breakdown", {}),
                "skills_found": skills,
                "missing_skills": list(set(ROLE_SKILLS.get(target_role, [])) - set(skills)),
                "insights": {
                    "strengths": ai_data.get("strengths", []),
                    "gaps": ai_data.get("weaknesses", []),
                    "recommendations": ai_data.get("suggestions", [])
                }
            }
            
            logger.info("--- FINAL RESPONSE SENT TO FRONTEND ---")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.exception("Unexpected error in Resume Analysis")
            return Response({'error': f"An unexpected system error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AnalyzeResumeTextView(APIView):
    """
    Analyze resume based on text input (from profile).
    """
    def post(self, request):
        resume_text = request.data.get('resume_text', '')
        if not resume_text:
            return Response({'error': 'No resume text provided'}, status=400)
            
        prompt = f"""
        Analyze the following resume text for a college student.
        Provide: 
        1. A score out of 100
        2. Strengths (bullet points)
        3. Weaknesses (bullet points)
        4. Career suggestions.
        
        Resume: {resume_text}
        
        Return in JSON format: {{"score": 85, "strengths": [], "weaknesses": [], "suggestions": []}}
        """
        
        ai_response = call_openrouter(prompt, system_prompt="You are a professional resume reviewer.")
        try:
            # Try to extract JSON if AI adds extra text
            if "```json" in ai_response:
                ai_response = ai_response.split("```json")[1].split("```")[0].strip()
            data = json.loads(ai_response)
            return Response(data)
        except:
            return Response({"raw_response": ai_response})


class ChatWithAIView(APIView):
    """
    Career assistant chatbot.
    """
    def post(self, request):
        user_message = request.data.get('message', '')
        context = request.data.get('context', {})
        
        # Get student profile if possible for better context
        profile_context = ""
        try:
            profile = StudentProfile.objects.get(user=request.user)
            profile_context = f"Student Skills: {[s.name for s in profile.skills.all()]}. Degree: {profile.degree}."
        except:
            pass

        prompt = f"Context: {profile_context}\n\nUser Question: {user_message}"
        response = call_openrouter(prompt)
        return Response({"reply": response})
