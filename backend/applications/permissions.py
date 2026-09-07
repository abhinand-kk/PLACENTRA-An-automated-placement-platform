from rest_framework import permissions

class IsStudentUser(permissions.BasePermission):
    """
    Allows access only to authenticated students.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'student_profile')
        )


class IsApplicationParticipant(permissions.BasePermission):
    """
    Object-level permission:
    - Student owns the application
    - Recruiter owns the job
    - Placement Officer belongs to the same institution as the student
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Check Student ownership
        if hasattr(user, 'student_profile') and obj.student == user.student_profile:
            return True

        # Check Recruiter ownership
        if hasattr(user, 'recruiter_profile') and obj.job.recruiter == user.recruiter_profile:
            return True

        # Check Placement Officer ownership (same institution)
        if hasattr(user, 'placement_officer_profile') and obj.student.institution == user.placement_officer_profile.institution:
            return True

        return False
