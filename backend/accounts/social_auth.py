from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


class GoogleLogin(SocialLoginView):
    """
    Google OAuth login for students and alumni only.
    Admin access is handled separately through Django admin panel.
    Supports login_type: 'student' or 'alumni'
    """
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = "postmessage"
    permission_classes = [AllowAny]
    
    def get_response(self):
        """
        Override to customize response after successful authentication.
        At this point, self.user is set and authenticated.
        """
        # Get user from self (set by parent class self.login())
        user = getattr(self, 'user', None)
        
        if not user or user.is_anonymous:
            return Response(
                {'error': 'Authentication failed or user not found.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Get login_type from original request data
        login_type = self.request.data.get('login_type', 'student')
        
        # Validate login_type
        if login_type not in ['student', 'alumni']:
            return Response(
                {'error': 'Invalid login_type. Must be "student" or "alumni".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # self.user is now authenticated (set by parent class)
        user = self.user
        
        # Set role if not already set
        if not user.role or user.role == '':
            user.role = login_type
            user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Return user data with tokens at root level (expected by frontend)
        from accounts.serializers import UserSerializer
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
