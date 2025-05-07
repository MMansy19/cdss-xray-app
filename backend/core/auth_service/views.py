from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication

from django.contrib.auth import authenticate, logout

from .models import CustomUser
from .serializers import UserSerializer

@api_view(['POST'])
def signup_view(request):
    """
    Handle user registration
    """
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_view(request):
    """
    Handle user login, return JWT token (access and refresh) on successful login
    """
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
    if user is not None:
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh)
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def logout_view(request):
    """
    Handle user logout
    """
    # Invalidate the token by not providing it anymore (you could handle token blacklisting)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])  # Use JWTAuthentication instead of SessionAuthentication
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Get the authenticated user's profile data
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
