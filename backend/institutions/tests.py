from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from institutions.models import Institution


class InstitutionSearchAPITests(TestCase):
    """
    Tests the institution search endpoint (/api/v1/institutions/)
    for verified institution discovery, partial name matches, case-insensitivity,
    alias resolution, and empty/no-result queries.
    """

    def setUp(self):
        self.client = APIClient()
        # Seed test institutions
        self.christ_uni = Institution.objects.create(
            institution_name='Christ University, Bengaluru',
            affiliated_university='Deemed to be University',
            address='Hosur Road, Bengaluru',
            district='Bengaluru Urban',
            state='Karnataka',
            pincode='560029',
            placement_email='placements@christuniversity.in',
            placement_phone='9845012345',
            is_active=True
        )
        self.christ_coll = Institution.objects.create(
            institution_name='Christ College (Autonomous), Irinjalakuda',
            affiliated_university='University of Calicut',
            address='Irinjalakuda, Thrissur',
            district='Thrissur',
            state='Kerala',
            pincode='680125',
            placement_email='placements@christcollegeijk.edu.in',
            placement_phone='9847012345',
            is_active=True
        )
        self.cet = Institution.objects.create(
            institution_name='College of Engineering Trivandrum (CET)',
            affiliated_university='APJ Abdul Kalam Technological University',
            address='Sreekaryam, Thiruvananthapuram',
            district='Thiruvananthapuram',
            state='Kerala',
            pincode='695016',
            placement_email='placement@cet.ac.in',
            placement_phone='9847345678',
            is_active=True
        )
        self.ajce = Institution.objects.create(
            institution_name='Amal Jyothi College of Engineering, Kottayam',
            affiliated_university='APJ Abdul Kalam Technological University',
            address='Kanjirappally, Kottayam',
            district='Kottayam',
            state='Kerala',
            pincode='686518',
            placement_email='placement@ajce.in',
            placement_phone='9876543210',
            is_active=True
        )

    def test_search_christ_returns_both_christ_institutions(self):
        """Searching for 'Christ' must return Christ University and Christ College."""
        response = self.client.get('/api/v1/institutions/?search=Christ')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item['institution_name'] for item in response.data['results']]
        self.assertIn('Christ University, Bengaluru', names)
        self.assertIn('Christ College (Autonomous), Irinjalakuda', names)
        self.assertNotIn('College of Engineering Trivandrum (CET)', names)

    def test_search_is_case_insensitive(self):
        """Searches with different capitalizations ('christ', 'CHRIST', 'ChRiSt') must return identical results."""
        for term in ['christ', 'CHRIST', 'ChRiSt']:
            response = self.client.get(f'/api/v1/institutions/?search={term}')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['count'], 2)
            names = [item['institution_name'] for item in response.data['results']]
            self.assertIn('Christ University, Bengaluru', names)

    def test_search_partial_name(self):
        """Entering partial institution names like 'Amal' or 'Jyothi' must discover the college."""
        response = self.client.get('/api/v1/institutions/?search=Amal')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item['institution_name'] for item in response.data['results']]
        self.assertIn('Amal Jyothi College of Engineering, Kottayam', names)

    def test_search_by_alias(self):
        """Searching with common acronyms (e.g. 'cet', 'ajce') discovers the target institution."""
        response = self.client.get('/api/v1/institutions/?search=cet')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item['institution_name'] for item in response.data['results']]
        self.assertIn('College of Engineering Trivandrum (CET)', names)

    def test_search_no_results_returns_empty_list_cleanly(self):
        """Searching for non-existent colleges returns count 0 without errors."""
        response = self.client.get('/api/v1/institutions/?search=NonExistentInstitutionXYZ')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)
        self.assertEqual(len(response.data['results']), 0)

    def test_empty_search_returns_all_active_institutions(self):
        """Unfiltered query returns all active institutions."""
        response = self.client.get('/api/v1/institutions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 4)
