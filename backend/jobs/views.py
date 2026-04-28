from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Job
from .serializers import JobSerializer
from .utils import get_job_recommendations
from profiles.models import StudentProfile

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.filter(is_active=True)
    serializer_class = JobSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    @action(detail=True, methods=['delete'])
    def delete(self, request, pk=None):
        job = self.get_object()
        if request.user != job.user:
            return Response({"error": "You do not have permission to delete this job."}, status=status.HTTP_403_FORBIDDEN)
        job.delete()
        return Response({"message": "Job deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        
    def destroy(self, request, *args, **kwargs):
        # Override standard destroy to also enforce permission
        job = self.get_object()
        if request.user != job.user:
            return Response({"error": "You do not have permission to delete this job."}, status=status.HTTP_403_FORBIDDEN)
        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        """
        Get AI-driven job recommendations for the current student.
        """
        if not hasattr(request.user, 'student_profile'):
            return Response({"error": "Only students can get recommendations"}, status=403)
        
        student_profile = request.user.student_profile
        job_ids = get_job_recommendations(student_profile)
        
        if job_ids:
            recommended_jobs = Job.objects.filter(id__in=job_ids)
            # Re-sort by the AI's order
            job_map = {job.id: job for job in recommended_jobs}
            sorted_jobs = [job_map[jid] for jid in job_ids if jid in job_map]
            serializer = self.get_serializer(sorted_jobs, many=True)
            return Response(serializer.data)
        
        # Fallback to general jobs
        return Response(self.get_serializer(self.queryset[:5], many=True).data)
