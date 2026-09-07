from rest_framework import serializers
from .models import Institution
from master_data.serializers import InstitutionTypeSerializer

class InstitutionSerializer(serializers.ModelSerializer):
    institution_type_detail = InstitutionTypeSerializer(source='institution_type', read_only=True)

    class Meta:
        model = Institution
        fields = (
            'id', 'institution_name', 'institution_type', 'institution_type_detail',
            'affiliated_university', 'address', 'district', 'state', 'pincode',
            'website', 'placement_email', 'placement_phone', 'is_active',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_pincode(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError("Pincode must contain only numeric digits.")
        return value
