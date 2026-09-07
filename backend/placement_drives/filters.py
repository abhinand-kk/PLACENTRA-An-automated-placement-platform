import django_filters
from .models import PlacementDrive

class PlacementDriveFilter(django_filters.FilterSet):
    institution = django_filters.NumberFilter(field_name='institution__id')
    recruiter = django_filters.NumberFilter(field_name='recruiter__id')
    status = django_filters.CharFilter(lookup_expr='exact')
    drive_date = django_filters.DateFilter()
    from_date = django_filters.DateFilter(field_name='drive_date', lookup_expr='gte')
    to_date = django_filters.DateFilter(field_name='drive_date', lookup_expr='lte')

    class Meta:
        model = PlacementDrive
        fields = ['institution', 'recruiter', 'status', 'drive_date', 'from_date', 'to_date']
