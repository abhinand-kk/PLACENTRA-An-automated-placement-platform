from rest_framework import permissions

class IsRecruiterUser(permissions.BasePermission):
    """
    Allows access only to authenticated recruiters.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'recruiter_profile')
        )


class IsJobOwner(permissions.BasePermission):
    """
    Allows access only to the recruiter who created the job.
    """
    def has_object_permission(self, request, view, obj):
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'recruiter_profile') and
            obj.recruiter == request.user.recruiter_profile
        )
