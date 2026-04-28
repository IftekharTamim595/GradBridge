"""
Search views for alumni discovery.
"""
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from profiles.models import AlumniProfile
from .serializers import AlumniSearchSerializer
from .filters import AlumniSearchFilter
from rest_framework.pagination import PageNumberPagination


class SearchResultsPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AlumniSearchView(generics.ListAPIView):
    """
    Search alumni by name, company, skills, university.
    
    Query params:
    - q: search query (searches name, company, position)
    - skills: comma-separated skill IDs or names
    - company: company name filter
    - university: university filter
    - city: city filter
    - available_for_mentorship: boolean
    """
    serializer_class = AlumniSearchSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = SearchResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AlumniSearchFilter
    search_fields = ['user__first_name', 'user__last_name', 'current_company', 'current_position', 'university']
    ordering_fields = ['created_at', 'years_of_experience']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filter queryset based on permissions and visibility.
        """
        queryset = AlumniProfile.objects.filter(
            visibility='public',
            user__is_active=True
        ).select_related('user').prefetch_related('skills')
        
        # Search query
        q = self.request.query_params.get('q', None)
        if q:
            queryset = queryset.filter(
                Q(user__first_name__icontains=q) |
                Q(user__last_name__icontains=q) |
                Q(current_company__icontains=q) |
                Q(current_position__icontains=q) |
                Q(university__icontains=q) |
                Q(industry__icontains=q)
            )
        
        # Skills filter (supports multiple skills)
        skills_param = self.request.query_params.get('skills', None)
        if skills_param:
            skill_ids = [s.strip() for s in skills_param.split(',') if s.strip()]
            if skill_ids:
                # Try parsing as IDs first
                try:
                    skill_ids_int = [int(sid) for sid in skill_ids]
                    queryset = queryset.filter(skills__id__in=skill_ids_int).distinct()
                except ValueError:
                    # If not IDs, treat as names
                    queryset = queryset.filter(skills__name__in=skill_ids).distinct()
        
        return queryset
