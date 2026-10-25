import re
from rest_framework.exceptions import ValidationError

def validate_mobile_number(phone, country='India'):
    """
    Validates mobile number based on country rules.
    For India (+91):
    - Trims surrounding whitespace and removes formatting punctuation.
    - Must be exactly 10 digits starting with 6, 7, 8, or 9.
    - Rejects all-repeated digits (e.g. 0000000000, 1111111111, 9999999999).
    - Rejects invalid characters, letters, symbols.
    For other countries:
    - Normalizes and verifies length (7-15 digits) and non-repeated placeholder digits.
    """
    if phone is None:
        raise ValidationError("Enter a valid mobile number.")

    phone_str = str(phone).strip()
    if not phone_str:
        raise ValidationError("Enter a valid mobile number.")

    # Remove standard formatting characters (spaces, dashes, parentheses)
    cleaned = re.sub(r'[\s\-\(\)]', '', phone_str)

    is_india = (country or 'India').strip().lower() in ['india', '+91', '91', 'in']

    if is_india:
        # Strip optional country prefix if provided
        if cleaned.startswith('+91'):
            cleaned = cleaned[3:]
        elif cleaned.startswith('91') and len(cleaned) == 12:
            cleaned = cleaned[2:]
        elif cleaned.startswith('0') and len(cleaned) == 11:
            cleaned = cleaned[1:]

        # Must consist solely of numeric digits
        if not cleaned.isdigit():
            raise ValidationError("Enter a valid 10-digit Indian mobile number.")

        # Exactly 10 digits
        if len(cleaned) != 10:
            raise ValidationError("Enter a valid 10-digit Indian mobile number.")

        # Must start with 6, 7, 8, or 9
        if cleaned[0] not in ['6', '7', '8', '9']:
            raise ValidationError("Enter a valid 10-digit Indian mobile number.")

        # Reject obvious placeholder numbers consisting entirely of repeated digits (0000000000, 1111111111, etc.)
        if len(set(cleaned)) <= 1:
            raise ValidationError("Enter a valid 10-digit Indian mobile number.")

        return cleaned
    else:
        # Generic international validation
        if cleaned.startswith('+'):
            digits_only = cleaned[1:]
        else:
            digits_only = cleaned

        if not digits_only.isdigit():
            raise ValidationError("Enter a valid mobile number.")

        if len(digits_only) < 7 or len(digits_only) > 15:
            raise ValidationError("Enter a valid mobile number.")

        if len(set(digits_only)) <= 1:
            raise ValidationError("Enter a valid mobile number.")

        return cleaned
