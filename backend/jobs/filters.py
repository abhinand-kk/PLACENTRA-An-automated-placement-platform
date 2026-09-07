import django_filters
from .models import Job

class JobFilter(django_filters.FilterSet):
    min_package = django_filters.NumberFilter(field_name='package_lpa', lookup_expr='gte')
    max_package = django_filters.NumberFilter(field_name='package_lpa', lookup_expr='lte')
    location = django_filters.CharFilter(lookup_expr='icontains')
    status = django_filters.CharFilter(lookup_expr='exact')
    campus_visit_required = django_filters.BooleanFilter()
    program = django_filters.NumberFilter(field_name='eligible_programs__id')
    branch = django_filters.NumberFilter(field_name='eligible_branches__id')
    employment_type = django_filters.NumberFilter(field_name='employment_type__id')
    hiring_type = django_filters.NumberFilter(field_name='hiring_type__id')
    work_mode = django_filters.NumberFilter(field_name='work_mode__id')

    class Meta:
        model = Job
        fields = [
            'status',
            'location',
            'campus_visit_required',
            'min_package',
            'max_package',
            'program',
            'branch',
            'employment_type',
            'hiring_type',
            'work_mode'
        ]
