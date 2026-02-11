from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Conversation, Message, ConversationParticipant
from .serializers import ConversationSerializer, MessageSerializer
from django.contrib.auth import get_user_model
from django.db.models import Count, Q

User = get_user_model()

class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        # Return conversations where the user is a participant
        # Annotate with the timestamp of the latest message to allow sorting without joining and duplicating rows
        from django.db.models import Max
        return Conversation.objects.filter(participants=self.request.user).annotate(
            last_msg_time=Max('messages__created_at')
        ).order_by('-last_msg_time')

    @action(detail=False, methods=['post'])
    def start(self, request):
        """
        Start or get existing conversation with a target user.
        Body: { "user_id": <id> }
        """
        target_user_id = request.data.get('user_id')
        if not target_user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if target_user == request.user:
            return Response({'error': 'Cannot chat with yourself'}, status=status.HTTP_400_BAD_REQUEST)

        # Check for existing conversation with these exact 2 participants
        # We find conversations where I am a participant, AND the other person is a participant
        # And the count of participants is 2.
        
        # Optimized query: find conversations containing both users
        conversations = Conversation.objects.filter(participants=request.user).filter(participants=target_user)
        
        # Filter for strictly 1-on-1 if necessary, but for now assuming all are 1-on-1 logic if we only add 2
        existing_conv = conversations.annotate(count=Count('participants')).filter(count=2).first()

        if existing_conv:
            serializer = self.get_serializer(existing_conv)
            return Response(serializer.data)

        # Create new conversation
        conversation = Conversation.objects.create()
        ConversationParticipant.objects.create(conversation=conversation, user=request.user)
        ConversationParticipant.objects.create(conversation=conversation, user=target_user)
        
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MessageListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = None # Or use standard pagination

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        # Ensure user is part of the conversation
        if not Conversation.objects.filter(id=conversation_id, participants=self.request.user).exists():
            return Message.objects.none()
        
        return Message.objects.filter(conversation_id=conversation_id).order_by('created_at')
