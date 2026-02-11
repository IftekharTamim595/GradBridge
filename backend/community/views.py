from rest_framework import viewsets, permissions
from .models import Post
from .serializers import PostSerializer

from accounts.permissions import IsStudent, IsAlumni

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated, (IsStudent | IsAlumni)]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
