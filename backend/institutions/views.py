from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q, Case, When, Value, IntegerField

from .models import Institution
from .serializers import InstitutionSerializer


COMMON_ALIASES = {
    'cet': 'College of Engineering Trivandrum (CET)',
    'nitc': 'National Institute of Technology Calicut (NITC)',
    'nit calicut': 'National Institute of Technology Calicut (NITC)',
    'iit palakkad': 'Indian Institute of Technology Palakkad (IIT Palakkad)',
    'iitpkd': 'Indian Institute of Technology Palakkad (IIT Palakkad)',
    'iit madras': 'Indian Institute of Technology Madras (IIT Madras)',
    'iitm': 'Indian Institute of Technology Madras (IIT Madras)',
    'iit bombay': 'Indian Institute of Technology Bombay (IIT Bombay)',
    'iisc': 'Indian Institute of Science (IISc), Bengaluru',
    'gec thrissur': 'Government Engineering College, Thrissur',
    'gect': 'Government Engineering College, Thrissur',
    'tkm': 'TKM College of Engineering, Kollam',
    'tkmce': 'TKM College of Engineering, Kollam',
    'mits': 'Muthoot Institute of Technology and Science (MITS), Ernakulam',
    'fisat': 'Federal Institute of Science and Technology (FISAT), Angamaly',
    'mace': 'Mar Athanasius College of Engineering, Kothamangalam',
    'mec': 'Model Engineering College, Thrikkakara',
    'bits': 'Birla Institute of Technology and Science (BITS), Pilani',
    'vit': 'Vellore Institute of Technology (VIT), Vellore',
    'mahe': 'Manipal Academy of Higher Education (MAHE), Manipal',
    'srm': 'SRM Institute of Science and Technology, Chennai',
    'psg': 'PSG College of Technology, Coimbatore',
    'du': 'University of Delhi (DU), New Delhi',
    'coep': 'College of Engineering Pune (COEP)',
    'ajce': 'Amal Jyothi College of Engineering, Kottayam',
    'christ': 'Christ University, Bengaluru'
}


class InstitutionSearchView(APIView):
    """
    Search and retrieve verified institutions and universities.
    Supports case-insensitive partial-name matching, acronyms, and location filtering.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('search') or request.query_params.get('q') or ''
        term = query.strip()

        try:
            limit = min(int(request.query_params.get('limit', 50)), 100)
        except (ValueError, TypeError):
            limit = 50

        qs = Institution.objects.filter(is_active=True)

        if term:
            term_lower = term.lower()
            q_filter = (
                Q(institution_name__icontains=term) |
                Q(affiliated_university__icontains=term) |
                Q(district__icontains=term) |
                Q(state__icontains=term)
            )

            # Check if term matches known aliases
            if term_lower in COMMON_ALIASES:
                canonical = COMMON_ALIASES[term_lower]
                q_filter |= Q(institution_name__icontains=canonical)

            # Check if any alias key is a substring or vice versa
            for alias_key, canonical_name in COMMON_ALIASES.items():
                if term_lower == alias_key or alias_key in term_lower:
                    q_filter |= Q(institution_name__icontains=canonical_name)

            qs = qs.filter(q_filter).annotate(
                exact_match=Case(
                    When(institution_name__iexact=term, then=Value(1)),
                    When(institution_name__istartswith=term, then=Value(2)),
                    When(institution_name__icontains=term, then=Value(3)),
                    default=Value(4),
                    output_field=IntegerField()
                )
            ).order_by('exact_match', 'institution_name')
        else:
            qs = qs.order_by('institution_name')

        results_qs = qs[:limit]
        serializer = InstitutionSerializer(results_qs, many=True)

        return Response({
            'count': qs.count(),
            'query': term,
            'results': serializer.data
        }, status=status.HTTP_200_OK)
