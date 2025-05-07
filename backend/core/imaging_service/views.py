from rest_framework.decorators import api_view, parser_classes, authentication_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from .knowledge_base import calculate
from datetime import datetime
from dateutil.relativedelta import relativedelta

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_scan(request):
    """
    Upload a medical scan image and check vitals then get result
    """
    try:
        # Check if image file was provided
        if 'image' not in request.FILES:
            return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get image file
        image_file = request.FILES['image']
        
        # Calculate age from birthdate
        try:
            birthdate_str = request.data.get('birthdate')
            if not birthdate_str:
                return Response({'error': 'Birthdate is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Parse birthdate (handle different possible formats)
            try:
                # Try ISO format (YYYY-MM-DD)
                birthdate = datetime.fromisoformat(birthdate_str.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # Try other common formats
                    birthdate = datetime.strptime(birthdate_str, '%m/%d/%Y')
                except ValueError:
                    return Response(
                        {'error': 'Invalid birthdate format. Please use YYYY-MM-DD or MM/DD/YYYY'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Calculate age using relativedelta for accurate years
            today = datetime.now()
            age = relativedelta(today, birthdate).years
            
        except Exception as e:
            return Response(
                {'error': f'Error calculating age: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extract parameters for the calculate function
        try:
            # Required parameters with validation
            params = {
                'systolic_pressure': int(request.data.get('systolicBP', 120)),
                'diastolic_pressure': int(request.data.get('diastolicBP', 80)),
                'temperature': float(request.data.get('temperature', 37.0)),
                'heart_rate': int(request.data.get('heartRate', 75)),
                'has_cough': request.data.get('hasCough', 'false').lower() == 'true',
                'has_headache': request.data.get('hasHeadaches', 'false').lower() == 'true',
                'can_smell': request.data.get('canSmellTaste', 'true').lower() == 'true',
                'age': float(age),  # Using calculated age
                'gender': request.data.get('gender', 'female'),
                'has_pneumonia': False
            }
        except (ValueError, TypeError) as e:
            return Response(
                {'error': f'Invalid parameter value: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate disease probabilities
        result = calculate(**params)
        
        # Include age in response for verification
        result['age'] = age
        
        return Response(result, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)