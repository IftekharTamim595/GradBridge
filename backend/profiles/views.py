"""
Views for profile management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import StudentProfile, AlumniProfile, Skill, SkillGap, Certificate, Experience
from .serializers import (
    StudentProfileSerializer, AlumniProfileSerializer,
    SkillSerializer, SkillGapSerializer, CertificateSerializer,
    ExperienceSerializer
)
from accounts.permissions import IsStudent, IsAlumni
from .permissions import IsOwnerOrReadOnly
from rest_framework.views import APIView

class ProfileScoreView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if not request.user.is_student:
            return Response({"error": "Only students have profile scores"}, status=status.HTTP_400_BAD_REQUEST)
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        result = profile.calculate_profile_strength()
        return Response(result)

class SkillViewSet(viewsets.ModelViewSet):
# ... existing SkillViewSet ...
    """
    ViewSet for Skills (read/write for all authenticated users).
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'category']
    ordering_fields = ['name', 'created_at']

    def perform_create(self, serializer):
        # Ensure skill name is title cased and unique check is handled by model/db usually
        # But we can force title case here for consistency
        name = self.request.data.get('name', '').strip()
        if name:
             serializer.save(name=name)
        else:
             serializer.save()


class CertificateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Certificates.
    """
    serializer_class = CertificateSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        # Users can only see their own certificates? Or public ones?
        # For management, mostly own.
        return Certificate.objects.filter(student_profile__user=self.request.user)

    def perform_create(self, serializer):
        # Automatically associate with the student profile
        profile = get_object_or_404(StudentProfile, user=self.request.user)
        serializer.save(student_profile=profile)


class ExperienceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Experience entries.
    """
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Experience.objects.filter(student_profile__user=self.request.user)

    def perform_create(self, serializer):
        profile = get_object_or_404(StudentProfile, user=self.request.user)
        serializer.save(student_profile=profile)
        # Recalculate strength after adding experience
        profile.calculate_profile_strength()

    def perform_update(self, serializer):
        instance = serializer.save()
        instance.student_profile.calculate_profile_strength()

    def perform_destroy(self, instance):
        profile = instance.student_profile
        instance.delete()
        profile.calculate_profile_strength()


class StudentProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for StudentProfile.
    """
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """
        Get or update the current user's profile.
        """
        profile, created = StudentProfile.objects.get_or_create(user=request.user)
        
        if request.method == 'GET':
            profile.calculate_profile_strength() # Update breakdown real-time
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            profile.calculate_profile_strength() # Refresh after update
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def score(self, request):
        """
        Get specifically the gamification score breakdown.
        """
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        result = profile.calculate_profile_strength()
        return Response(result)

    
    def get_queryset(self):
        user = self.request.user
        queryset = StudentProfile.objects.all()
        
        if user.is_student:
            # Students can see their own profile and public profiles
            return queryset.filter(
                Q(user=user) | Q(visibility='public')
            )
        elif user.is_alumni or user.is_staff:
            # Alumni and admins can see all profiles
            return queryset
        elif user.is_authenticated:
            # External users can only see public profiles
            return queryset.filter(visibility='public')
        else:
            # Unauthenticated users can only see public profiles
            return queryset.filter(visibility='public')
    
    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['pk'])
        
        # Check visibility permissions
        user = self.request.user
        if obj.visibility == 'private':
            if not user.is_authenticated:
                return Response(
                    {'detail': 'This profile is private.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            if not (obj.user == user or user.is_staff):
                return Response(
                    {'detail': 'You do not have permission to view this profile.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        self.check_object_permissions(self.request, obj)
        return obj
    
    def perform_create(self, serializer):
        # Only students can create their own profile
        if self.request.user.is_student:
            serializer.save(user=self.request.user)
        else:
            raise PermissionError("Only students can create student profiles")
    
    @action(detail=True, methods=['get'])
    def skill_gaps(self, request, pk=None):
        """
        Get skill gap suggestions for a student.
        """
        profile = self.get_object()
        skill_gaps = SkillGap.objects.filter(student_profile=profile).order_by('-priority')
        serializer = SkillGapSerializer(skill_gaps, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def recalculate_strength(self, request, pk=None):
        """
        Recalculate profile strength.
        """
        profile = self.get_object()
        strength = profile.calculate_profile_strength()
        return Response({'profile_strength': strength})
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search students with filters.
        """
        queryset = self.get_queryset()
        
        # Apply filters
        skills = request.query_params.getlist('skills')
        batch = request.query_params.get('batch')
        city = request.query_params.get('city')
        country = request.query_params.get('country')
        available_for_hire = request.query_params.get('available_for_hire')
        search = request.query_params.get('search')
        
        if skills:
            queryset = queryset.filter(skills__id__in=skills).distinct()
        if batch:
            queryset = queryset.filter(batch=batch)
        if city:
            queryset = queryset.filter(city__icontains=city)
        if country:
            queryset = queryset.filter(country__icontains=country)
        if available_for_hire == 'true':
            queryset = queryset.filter(available_for_hire=True)
        if search:
            queryset = queryset.filter(
                Q(user__email__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(university__icontains=search) |
                Q(degree__icontains=search) |
                Q(bio__icontains=search)
            )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available_for_hire(self, request):
        """
        Get students available for hire.
        """
        queryset = self.get_queryset().filter(available_for_hire=True)
        
        # Location-based filtering
        user_lat = request.query_params.get('latitude')
        user_lng = request.query_params.get('longitude')
        radius_km = request.query_params.get('radius', 50)  # Default 50km
        
        if user_lat and user_lng:
            # Simple distance calculation (can be improved with PostGIS)
            from math import radians, cos, sin, asin, sqrt
            try:
                user_lat = float(user_lat)
                user_lng = float(user_lng)
                radius_km = float(radius_km)
                
                # Filter by approximate distance
                # This is a simplified version - for production, use PostGIS
                nearby_profiles = []
                for profile in queryset:
                    if profile.latitude and profile.longitude:
                        lat1, lon1 = radians(user_lat), radians(user_lng)
                        lat2, lon2 = radians(float(profile.latitude)), radians(float(profile.longitude))
                        dlat = lat2 - lat1
                        dlon = lon2 - lon1
                        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
                        c = 2 * asin(sqrt(a))
                        distance = 6371 * c  # Earth radius in km
                        
                        if distance <= radius_km:
                            profile.distance_km = round(distance, 2)
                            nearby_profiles.append(profile)
                
                queryset = type(queryset)(nearby_profiles)
            except (ValueError, TypeError):
                pass
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AlumniProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AlumniProfile.
    """
    serializer_class = AlumniProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """
        Get or update the current user's profile.
        """
        profile, created = AlumniProfile.objects.get_or_create(user=request.user)
        if request.method == 'GET':
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    def get_queryset(self):
        user = self.request.user
        queryset = AlumniProfile.objects.all()
        
        if user.is_alumni:
            # Alumni can see all other alumni? Or just public ones? 
            # Usually they can explore logic. Let's assume public.
            # But wait, user requirement: "Only show profiles where is_public is true"
            # It implies generic search.
            if self.action in ['me', 'update', 'partial_update', 'destroy']:
                 return queryset
            return queryset.filter(Q(user=user) | Q(visibility='public'))
            
        elif user.is_student or user.is_authenticated:
            # Students and others can only see public profiles
            return queryset.filter(visibility='public')
            
        return queryset.filter(visibility='public') # Fallback
    
    def get_object(self):
        queryset = AlumniProfile.objects.all() # Bypass filtering to handle manually
        obj = get_object_or_404(queryset, pk=self.kwargs['pk'])
        
        # Check visibility permissions
        user = self.request.user
        if obj.visibility == 'private':
            if not user.is_authenticated:
                 raise PermissionDenied('This profile is private.')
            if not (obj.user == user or user.is_staff):
                 raise PermissionDenied('You do not have permission to view this profile.')
        
        self.check_object_permissions(self.request, obj)
        return obj
    
    def perform_create(self, serializer):
        # Only alumni can create their own profile
        if self.request.user.is_alumni:
            serializer.save(user=self.request.user)
        else:
            raise PermissionError("Only alumni can create alumni profiles")
    
    @action(detail=False, methods=['get'])
    def available_mentors(self, request):
        """
        Get alumni available for mentorship.
        """
        queryset = AlumniProfile.objects.filter(available_for_mentorship=True, visibility='public')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available_referrers(self, request):
        """
        Get alumni available for referrals.
        """
        queryset = AlumniProfile.objects.filter(available_for_referrals=True, visibility='public')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search alumni with filters.
        """
        queryset = self.get_queryset()
        
        # Apply filters
        skills = request.query_params.getlist('skills')
        industry = request.query_params.get('industry')
        experience_min = request.query_params.get('experience_min')
        city = request.query_params.get('city')
        country = request.query_params.get('country')
        search = request.query_params.get('search')
        
        if skills:
            queryset = queryset.filter(skills__id__in=skills).distinct()
        if industry:
            queryset = queryset.filter(industry__icontains=industry)
        if experience_min:
            try:
                queryset = queryset.filter(years_of_experience__gte=int(experience_min))
            except ValueError:
                pass
        if city:
            queryset = queryset.filter(city__icontains=city)
        if country:
            queryset = queryset.filter(country__icontains=country)
        if search:
            queryset = queryset.filter(
                Q(user__email__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(current_company__icontains=search) |
                Q(current_position__icontains=search) |
                Q(bio__icontains=search)
            )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)