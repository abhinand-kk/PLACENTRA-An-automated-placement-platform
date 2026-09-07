from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import RecruiterProfile, RecruiterHiringPreference
from .serializers import RecruiterProfileSerializer, RecruiterHiringPreferenceSerializer
from jobs.models import Job
from applications.models import Application


def get_recruiter_profile(user):
    if not hasattr(user, 'recruiter_profile'):
        return None
    return user.recruiter_profile


class RecruiterProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_recruiter_profile(request.user)
        if not profile:
            return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RecruiterProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile = get_recruiter_profile(request.user)
        if not profile:
            return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecruiterHiringPreferenceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_recruiter_profile(request.user)
        if not profile:
            return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not hasattr(profile, 'hiring_preference'):
            return Response({'message': 'No hiring preferences set yet.'}, status=status.HTTP_200_OK)
        serializer = RecruiterHiringPreferenceSerializer(profile.hiring_preference)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile = get_recruiter_profile(request.user)
        if not profile:
            return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        pref = getattr(profile, 'hiring_preference', None)
        if pref:
            serializer = RecruiterHiringPreferenceSerializer(pref, data=request.data, partial=True)
        else:
            serializer = RecruiterHiringPreferenceSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(recruiter=profile)
            return Response(serializer.data, status=status.HTTP_200_OK if pref else status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecruiterDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_recruiter_profile(request.user)
        if not profile:
            return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        recruiter_jobs = Job.objects.filter(recruiter=profile)
        total_jobs_posted = recruiter_jobs.count()
        active_jobs = recruiter_jobs.filter(status=Job.Status.OPEN).count()
        closed_jobs = recruiter_jobs.filter(status=Job.Status.CLOSED).count()

        recruiter_apps = Application.objects.filter(job__recruiter=profile)
        total_applications_received = recruiter_apps.count()
        shortlisted_students = recruiter_apps.filter(application_status=Application.ApplicationStatus.SHORTLISTED).count()
        interviews_scheduled = recruiter_apps.filter(application_status=Application.ApplicationStatus.INTERVIEW_SCHEDULED).count()
        selected_candidates = recruiter_apps.filter(application_status=Application.ApplicationStatus.SELECTED).count()

        data = {
            'total_jobs_posted': total_jobs_posted,
            'active_jobs': active_jobs,
            'closed_jobs': closed_jobs,
            'total_applications_received': total_applications_received,
            'shortlisted_students': shortlisted_students,
            'interviews_scheduled': interviews_scheduled,
            'selected_candidates': selected_candidates
        }
        return Response(data, status=status.HTTP_200_OK)
