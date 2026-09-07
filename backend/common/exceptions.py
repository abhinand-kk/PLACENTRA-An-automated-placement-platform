import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('placentra')

def custom_exception_handler(exc, context):
    """
    Standardized global DRF exception handler.
    Returns consistent JSON response format for all API errors.
    """
    response = exception_handler(exc, context)

    if response is not None:
        message = 'Validation or request handling error'
        if hasattr(exc, 'detail') and isinstance(exc.detail, str):
            message = exc.detail
        elif isinstance(response.data, dict) and 'detail' in response.data:
            message = str(response.data['detail'])

        custom_data = {
            'status': 'error',
            'code': response.status_code,
            'message': message,
            'errors': response.data
        }
        response.data = custom_data
    else:
        logger.exception("Unhandled server exception in context: %s", context)
        response = Response({
            'status': 'error',
            'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            'message': 'An internal server error occurred.',
            'errors': None
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
