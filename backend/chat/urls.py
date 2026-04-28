from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import ConversationViewSet, MessageListView

router = SimpleRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('', include(router.urls)),
    path('messages/<int:conversation_id>/', MessageListView.as_view(), name='conversation-messages'),
]
