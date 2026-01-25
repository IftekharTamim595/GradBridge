"""
Views for mentorship app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from .models import MentorshipRequest, ReferralRequest, Message
from .serializers import (
    MentorshipRequestSerializer, ReferralRequestSerializer, MessageSerializer
)
from accounts.permissions import IsStudent, IsAlumni


class MentorshipRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for MentorshipRequest.
    """
    serializer_class = MentorshipRequestSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_student:
            from profiles.models import StudentProfile
            try:
                student_profile = StudentProfile.objects.get(user=user)
                return MentorshipRequest.objects.filter(student_profile=student_profile)
            except StudentProfile.DoesNotExist:
                return MentorshipRequest.objects.none()
        
        elif user.is_alumni:
            from profiles.models import AlumniProfile
            try:
                alumni_profile = AlumniProfile.objects.get(user=user)
                return MentorshipRequest.objects.filter(alumni_profile=alumni_profile)
            except AlumniProfile.DoesNotExist:
                return MentorshipRequest.objects.none()
        
        elif user.is_admin:
            return MentorshipRequest.objects.all()
        
        return MentorshipRequest.objects.none()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        if not self.request.user.is_student:
            raise PermissionError("Only students can create mentorship requests")
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """
        Accept a mentorship request (alumni only).
        """
        mentorship = self.get_object()
        
        if not request.user.is_alumni:
            return Response(
                {'error': 'Only alumni can accept mentorship requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if mentorship.status != 'pending':
            return Response(
                {'error': 'Request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        mentorship.status = 'accepted'
        mentorship.responded_at = timezone.now()
        mentorship.save()
        
        # Update alumni stats
        mentorship.alumni_profile.students_mentored_count += 1
        mentorship.alumni_profile.save()
        
        serializer = self.get_serializer(mentorship)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject a mentorship request (alumni only).
        """
        mentorship = self.get_object()
        
        if not request.user.is_alumni:
            return Response(
                {'error': 'Only alumni can reject mentorship requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if mentorship.status != 'pending':
            return Response(
                {'error': 'Request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        mentorship.status = 'rejected'
        mentorship.responded_at = timezone.now()
        mentorship.save()
        
        serializer = self.get_serializer(mentorship)
        return Response(serializer.data)


class ReferralRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ReferralRequest.
    """
    serializer_class = ReferralRequestSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status']
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_student:
            from profiles.models import StudentProfile
            try:
                student_profile = StudentProfile.objects.get(user=user)
                return ReferralRequest.objects.filter(student_profile=student_profile)
            except StudentProfile.DoesNotExist:
                return ReferralRequest.objects.none()
        
        elif user.is_alumni:
            from profiles.models import AlumniProfile
            try:
                alumni_profile = AlumniProfile.objects.get(user=user)
                return ReferralRequest.objects.filter(alumni_profile=alumni_profile)
            except AlumniProfile.DoesNotExist:
                return ReferralRequest.objects.none()
        
        elif user.is_admin:
            return ReferralRequest.objects.all()
        
        return ReferralRequest.objects.none()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        if not self.request.user.is_student:
            raise PermissionError("Only students can create referral requests")
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """
        Accept a referral request and generate recommendation letter (alumni only).
        """
        referral = self.get_object()
        
        if not request.user.is_alumni:
            return Response(
                {'error': 'Only alumni can accept referral requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if referral.status != 'pending':
            return Response(
                {'error': 'Request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate recommendation letter using ML engine
        from ml_engine.services import RecommendationLetterService
        letter_service = RecommendationLetterService()
        recommendation_letter = letter_service.generate_letter(
            student_profile=referral.student_profile,
            target_role=referral.target_role,
            target_company=referral.target_company
        )
        
        referral.recommendation_letter = recommendation_letter
        referral.status = 'accepted'
        referral.responded_at = timezone.now()
        referral.save()
        
        # Update alumni stats
        referral.alumni_profile.referrals_made_count += 1
        referral.alumni_profile.save()
        
        serializer = self.get_serializer(referral)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject a referral request (alumni only).
        """
        referral = self.get_object()
        
        if not request.user.is_alumni:
            return Response(
                {'error': 'Only alumni can reject referral requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if referral.status != 'pending':
            return Response(
                {'error': 'Request is not pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        referral.status = 'rejected'
        referral.responded_at = timezone.now()
        referral.save()
        
        serializer = self.get_serializer(referral)
        return Response(serializer.data)
    
    @action(detail=True, methods=['put', 'patch'])
    def update_letter(self, request, pk=None):
        """
        Update recommendation letter (alumni only).
        """
        referral = self.get_object()
        
        if not request.user.is_alumni:
            return Response(
                {'error': 'Only alumni can update recommendation letters'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        recommendation_letter = request.data.get('recommendation_letter', '')
        if recommendation_letter:
            referral.recommendation_letter = recommendation_letter
            referral.save()
        
        serializer = self.get_serializer(referral)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Message.
    """
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    ordering_fields = ['created_at']
    
    def get_queryset(self):
        user = self.request.user
        # Users can see messages where they are sender or receiver
        return Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        )
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    @action(detail=False, methods=['get'])
    def conversation(self, request):
        """
        Get conversation between current user and another user.
        """
        other_user_id = request.query_params.get('user_id')
        if not other_user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from accounts.models import User
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        messages = Message.objects.filter(
            Q(sender=request.user, receiver=other_user) |
            Q(sender=other_user, receiver=request.user)
        ).order_by('created_at')
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
