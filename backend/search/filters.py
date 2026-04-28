"""
Django filters for search functionality.
"""
import django_filters
from profiles.models import AlumniProfile


class AlumniSearchFilter(django_filters.FilterSet):
    """
    Filter class for alumni search.
    """
    company = django_filters.CharFilter(field_name='current_company', lookup_expr='icontains')
    university = django_filters.CharFilter(lookup_expr='icontains')
    city = django_filters.CharFilter(lookup_expr='icontains')
    industry = django_filters.CharFilter(lookup_expr='icontains')
    available_for_mentorship = django_filters.BooleanFilter()
    available_for_referrals = django_filters.BooleanFilter()
    min_experience = django_filters.NumberFilter(field_name='years_of_experience', lookup_expr='gte')
    max_experience = django_filters.NumberFilter(field_name='years_of_experience', lookup_expr='lte')
    
    class Meta:
        model = AlumniProfile
        fields = [
            'company', 'university', 'city', 'industry',
            'available_for_mentorship', 'available_for_referrals',
            'min_experience', 'max_experience'
        ]
