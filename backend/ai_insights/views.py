from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.conf import settings
from .utils import ResumeParser, SkillExtractor, ResumeScorer, CareerAdvisor, ROLE_SKILLS
from .openrouter import call_openrouter
from profiles.models import StudentProfile
import os
import re
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
            
            # 3. Local Scoring (Deterministic & Reliable)
            score_data = ResumeScorer.calculate_score(skills, target_role, normalized_text)
            
            # 4. AI Analysis Prompt (Qualitative Feedback)
            prompt = f"""
            Audit this resume for a '{target_role}' role.
            Detected Skills: {', '.join(skills)}
            Calculated Score: {score_data['total_score']}/100
            
            Resume Content: {normalized_text[:3000]}

            Return ONLY a valid JSON object:
            {{
                "strengths": string[],
                "weaknesses": string[],
                "suggestions": string[]
            }}
            Rules: No markdown, no extra text, valid JSON only.
            """

            # 5. Call AI Service
            raw_ai_response = call_openrouter(prompt, system_prompt="You are a professional resume auditor.")
            logger.info(f"--- RAW AI RESPONSE ---\n{raw_ai_response}")

            # 6. Safe JSON Parsing
            insights = {
                "strengths": [],
                "gaps": [],
                "recommendations": []
            }
            
            try:
                clean_json = raw_ai_response.strip()
                # Handle markdown code blocks
                if "```" in clean_json:
                    clean_json = re.sub(r'```json|```', '', clean_json).strip()
                
                ai_data = json.loads(clean_json)
                insights = {
                    "strengths": ai_data.get("strengths", []),
                    "gaps": ai_data.get("weaknesses", []),
                    "recommendations": ai_data.get("suggestions", [])
                }
            except Exception as e:
                logger.error(f"AI Insights Parsing Error: {str(e)}")
                # Fallback to local heuristic insights
                insights = CareerAdvisor.generate_insights(score_data, target_role)

            # 7. Final Data Assembly
            response_data = {
                "score": score_data["total_score"],
                "breakdown": score_data["breakdown"],
                "skills_found": skills,
                "missing_skills": score_data["missing_skills"],
                "insights": insights
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
            elif "```" in ai_response:
                ai_response = ai_response.split("```")[1].split("```")[0].strip()
                
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
