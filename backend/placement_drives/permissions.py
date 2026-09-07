from rest_framework import permissions

class IsPlacementOfficerUser(permissions.BasePermission):
    """
    Allows access only to authenticated placement officers.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'placement_officer_profile')
        )


class IsOfficerInstitutionOwner(permissions.BasePermission):
    """
    Allows access only to the placement officer of the drive's institution.
    """
    def has_object_permission(self, request, view, obj):
        return bool(
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'placement_officer_profile') and
            obj.institution == request.user.placement_officer_profile.institution
        )
