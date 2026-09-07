import os
import random
import datetime
import traceback
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.conf import settings

from .models import (
    StudentProfile,
    StudentContact,
    StudentCurrentEducation,
    StudentPreviousEducation,
    StudentExperience,
    StudentDocument
)
from .serializers import (
    StudentProfileSerializer,
    StudentContactSerializer,
    StudentCurrentEducationSerializer,
    StudentPreviousEducationSerializer,
    StudentExperienceSerializer,
    StudentDocumentSerializer
)


def get_student_profile(user):
    if not hasattr(user, 'student_profile'):
        return None
    return user.student_profile


def calculate_student_completion(profile):
    try:
        score = 0
        # 1. Basic Details (20%)
        if profile.first_name and profile.last_name and profile.register_number:
            score += 20

        # 2. Contact Details (20%)
        try:
            c = getattr(profile, 'contact', None)
            if c and c.primary_email and c.mobile_number:
                score += 20
        except Exception:
            pass

        # 3. Current Education (20%)
        try:
            ce = getattr(profile, 'current_education', None)
            if ce and (ce.field_of_study or ce.cgpa is not None):
                score += 20
        except Exception:
            pass

        # 4. Previous Education (15%)
        try:
            if profile.previous_educations.exists():
                score += 15
        except Exception:
            pass

        # 5. Experience / Skills (15%)
        try:
            if profile.experiences.exists():
                score += 15
        except Exception:
            pass

        # 6. Documents Uploaded (10%)
        try:
            d = getattr(profile, 'documents', None)
            if d:
                doc_count = 0
                if d.resume: doc_count += 1
                if d.class10_certificate: doc_count += 1
                if d.class12_certificate: doc_count += 1
                if d.degree_marksheet: doc_count += 1

                if doc_count >= 2:
                    score += 10
                elif doc_count == 1:
                    score += 5
        except Exception:
            pass

        profile.profile_completion = score
        profile.save(update_fields=['profile_completion'])
        return score
    except Exception as e:
        print("Error calculating completion:", e)
        return getattr(profile, 'profile_completion', 0)


def format_file_size(size_in_bytes):
    if size_in_bytes < 1024 * 1024:
        return f"{round(size_in_bytes / 1024)} KB"
    return f"{round(size_in_bytes / (1024 * 1024), 1)} MB"


class StudentProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        calculate_student_completion(profile)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        try:
            profile = get_student_profile(request.user)
            if not profile:
                return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            print("DEBUG StudentProfileView PUT Payload:", request.data)
            data = request.data.copy()
            if 'date_of_birth' in data and not data['date_of_birth']:
                data.pop('date_of_birth')

            serializer = StudentProfileSerializer(profile, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                calculate_student_completion(profile)
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            print("DEBUG StudentProfileView Validation Errors:", serializer.errors)
            return Response({
                "status": "validation_error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc()
            return Response({
                "status": "server_error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentContactView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        contact, _ = StudentContact.objects.get_or_create(student=profile)
        serializer = StudentContactSerializer(contact)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        try:
            profile = get_student_profile(request.user)
            if not profile:
                return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
            contact, _ = StudentContact.objects.get_or_create(student=profile)
            
            print("DEBUG StudentContactView PUT Payload:", request.data)
            serializer = StudentContactSerializer(contact, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                calculate_student_completion(profile)
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            print("DEBUG StudentContactView Validation Errors:", serializer.errors)
            return Response({
                "status": "validation_error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc()
            return Response({
                "status": "server_error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentCurrentEducationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not hasattr(profile, 'current_education'):
            return Response({'message': 'No current education details added.'}, status=status.HTTP_200_OK)
        serializer = StudentCurrentEducationSerializer(profile.current_education)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        try:
            profile = get_student_profile(request.user)
            if not profile:
                return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            print("DEBUG StudentCurrentEducationView PUT Payload:", request.data)
            current_edu = getattr(profile, 'current_education', None)
            if not current_edu:
                from master_data.models import Program, Branch
                default_program, _ = Program.objects.get_or_create(name='Integrated MCA')
                default_branch, _ = Branch.objects.get_or_create(program=default_program, name='Computer Science & Engineering')
                current_edu = StudentCurrentEducation.objects.create(
                    student=profile,
                    program=default_program,
                    branch=default_branch,
                    field_of_study=request.data.get('field_of_study', 'Computer Science & Engineering'),
                    start_date=datetime.date(2024, 8, 1),
                    end_date=datetime.date(2026, 6, 30),
                    batch=request.data.get('batch', '2024 - 2026'),
                    semester=request.data.get('semester', '4'),
                    cgpa=request.data.get('cgpa', 8.5),
                    active_backlogs=request.data.get('active_backlogs', 0)
                )

            serializer = StudentCurrentEducationSerializer(current_edu, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save(student=profile)
                calculate_student_completion(profile)
                return Response(serializer.data, status=status.HTTP_200_OK)
            
            print("DEBUG StudentCurrentEducationView Validation Errors:", serializer.errors)
            return Response({
                "status": "validation_error",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc()
            return Response({
                "status": "server_error",
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudentPreviousEducationListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        qs = StudentPreviousEducation.objects.filter(student=profile)
        serializer = StudentPreviousEducationSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = StudentPreviousEducationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student=profile)
            calculate_student_completion(profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentPreviousEducationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        instance = get_object_or_404(StudentPreviousEducation, pk=pk, student=profile)
        serializer = StudentPreviousEducationSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            calculate_student_completion(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        instance = get_object_or_404(StudentPreviousEducation, pk=pk, student=profile)
        instance.delete()
        calculate_student_completion(profile)
        return Response({'message': 'Previous education deleted.'}, status=status.HTTP_200_OK)


class StudentExperienceListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        qs = StudentExperience.objects.filter(student=profile)
        serializer = StudentExperienceSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = StudentExperienceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(student=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentExperienceDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        instance = get_object_or_404(StudentExperience, pk=pk, student=profile)
        serializer = StudentExperienceSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        instance = get_object_or_404(StudentExperience, pk=pk, student=profile)
        instance.delete()
        return Response({'message': 'Experience deleted.'}, status=status.HTTP_200_OK)


class StudentDocumentView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'message': 'No documents uploaded yet.'}, status=status.HTTP_200_OK)
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        doc, _ = StudentDocument.objects.get_or_create(student=profile)
        serializer = StudentDocumentSerializer(doc)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        if not request.user.is_authenticated:
            return Response({'message': 'Document stored locally for registration.'}, status=status.HTTP_200_OK)
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'profile_photo' in request.FILES or 'profile_photo' in request.data:
            profile_photo = request.FILES.get('profile_photo') or request.data.get('profile_photo')
            if profile_photo:
                profile.profile_photo = profile_photo
                profile.save(update_fields=['profile_photo'])

        doc, _ = StudentDocument.objects.get_or_create(student=profile)
        serializer = StudentDocumentSerializer(doc, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            calculate_student_completion(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentDocumentUploadView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        document_type = request.data.get('document_type')
        file_obj = request.FILES.get('file')

        if not document_type or not file_obj:
            return Response({'error': 'Document type and file object are required.'}, status=status.HTTP_400_BAD_REQUEST)

        file_name = file_obj.name
        file_size = file_obj.size
        ext = os.path.splitext(file_name)[1].lower()

        # Validation Rules
        if document_type == 'profile_photo':
            if ext not in ['.jpg', '.jpeg', '.png']:
                return Response({'error': 'Invalid file format. Profile photo must be JPG, JPEG, or PNG.'}, status=status.HTTP_400_BAD_REQUEST)
            if file_size > 2 * 1024 * 1024:
                return Response({'error': 'File size exceeds maximum limit of 2 MB.'}, status=status.HTTP_400_BAD_REQUEST)

        elif document_type == 'resume':
            if ext not in ['.pdf']:
                return Response({'error': 'Invalid file format. Resume must be a PDF file.'}, status=status.HTTP_400_BAD_REQUEST)
            if file_size > 5 * 1024 * 1024:
                return Response({'error': 'File size exceeds maximum limit of 5 MB.'}, status=status.HTTP_400_BAD_REQUEST)

        elif document_type in ['class10_certificate', 'class12_certificate', 'degree_marksheet']:
            if ext not in ['.pdf', '.jpg', '.jpeg', '.png']:
                return Response({'error': 'Invalid file format. Academic certificates must be PDF, JPG, JPEG, or PNG.'}, status=status.HTTP_400_BAD_REQUEST)
            if file_size > 5 * 1024 * 1024:
                return Response({'error': 'File size exceeds maximum limit of 5 MB.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Unsupported document type.'}, status=status.HTTP_400_BAD_REQUEST)

        now_str = datetime.datetime.now().strftime("%d %b %Y")
        formatted_size = format_file_size(file_size)

        # Save to database if user is authenticated, else save to default_storage for registration
        file_url = f"/media/student_documents/{document_type}/{file_name}"
        if request.user.is_authenticated and hasattr(request.user, 'student_profile'):
            profile = request.user.student_profile
            if document_type == 'profile_photo':
                profile.profile_photo = file_obj
                profile.save(update_fields=['profile_photo'])
                file_url = profile.profile_photo.url
            else:
                doc, _ = StudentDocument.objects.get_or_create(student=profile)
                setattr(doc, document_type, file_obj)
                doc.save()
                file_url = getattr(doc, document_type).url
                calculate_student_completion(profile)
        else:
            from django.core.files.storage import default_storage
            saved_path = default_storage.save(f'student_documents/{document_type}/{file_name}', file_obj)
            file_url = default_storage.url(saved_path)

        return Response({
            'message': 'File uploaded and validated successfully.',
            'document_type': document_type,
            'file_name': file_name,
            'file_size': formatted_size,
            'file_size_bytes': file_size,
            'uploaded_date': now_str,
            'file_url': file_url,
            'status': 'Uploaded',
            'verified': True
        }, status=status.HTTP_200_OK)


class DigiLockerFetchView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        student_name = request.data.get('student_name', 'Abhinand K K')

        # Development Mode Mock DigiLocker Integration
        random_suffix = random.randint(100000, 999999)
        digilocker_id = f"DL-DEG-2026-{random_suffix}"
        now_dt = datetime.datetime.now()
        fetch_timestamp = now_dt.strftime("%d %b %Y, %H:%M:%S")
        now_str = now_dt.strftime("%d %b %Y")
        file_name = "Degree_Marksheet_DigiLocker.pdf"
        file_size_bytes = 655360
        formatted_size = format_file_size(file_size_bytes)
        file_url = f"/media/student_documents/degree/{file_name}"

        return Response({
            'message': 'Degree marksheet fetched successfully from DigiLocker.',
            'digilocker_id': digilocker_id,
            'file_name': file_name,
            'file_size': formatted_size,
            'file_size_bytes': file_size_bytes,
            'fetch_timestamp': fetch_timestamp,
            'uploaded_date': now_str,
            'student_name': student_name,
            'file_url': file_url,
            'status': 'Fetched',
            'verified': True
        }, status=status.HTTP_200_OK)


class StudentProfileCompletionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_student_profile(request.user)
        if not profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        percentage = calculate_student_completion(profile)
        return Response({'completion_percentage': percentage}, status=status.HTTP_200_OK)
