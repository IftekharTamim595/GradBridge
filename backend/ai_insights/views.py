from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from django.conf import settings
from .utils import ResumeParser, SkillExtractor, ResumeScorer, CareerAdvisor
import os

class AnalyzeResumeView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('resume')
        target_role = request.data.get('role', 'fullstack')
        
        if not file_obj:
            return Response({'error': 'No resume file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # pdfplumber expects a path or file-like object. APIView files are InMemoryUploadedFile
            # We might need to save it to a temp file if pdfplumber struggles, but usually it works with file-like objects.
            # Let's try passing the file object directly.
            
            text = ResumeParser.extract_text_from_pdf(file_obj)
            if not text:
                 return Response({'error': 'Could not extract text from PDF. Ensure it is a valid PDF file.'}, status=status.HTTP_400_BAD_REQUEST)
                 
            normalized_text = ResumeParser.normalize_text(text)
            skills = SkillExtractor.extract_skills(normalized_text)
            
            score_data = ResumeScorer.calculate_score(skills, target_role, normalized_text)
            
            insights = CareerAdvisor.generate_insights(score_data, target_role)
            
            response_data = {
                "score": score_data["total_score"],
                "breakdown": score_data["breakdown"],
                "skills_found": skills,
                "missing_skills": list(score_data["missing_skills"]),
                "insights": insights
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
