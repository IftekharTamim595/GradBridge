import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope['user']

        print(f"WS Connect: User={self.user}, ID={self.user.id if self.user.is_authenticated else 'None'}, Conversation={self.conversation_id}")

        if self.user.is_anonymous:
            print("WS Reject: Anonymous User")
            await self.close()
            return

        # Verify user is participant
        is_participant = await self.is_participant()
        if not is_participant:
            print(f"WS Reject: User {self.user.id} not participant in {self.conversation_id}")
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_content = text_data_json.get('message')
            if not message_content:
                return # Ignore empty messages
        except json.JSONDecodeError:
            return # Ignore invalid JSON

        # Save message to database
        message = await self.save_message(message_content)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_content,
                'sender_id': self.user.id,
                'sender_name': f"{self.user.first_name} {self.user.last_name}",
                'created_at': message.created_at.isoformat()
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        sender_id = event['sender_id']
        sender_name = event['sender_name']
        created_at = event['created_at']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'content': message,
            'sender': {'id': sender_id, 'name': sender_name}, # keeping distinct structure vs REST
            'sender_id': sender_id, # flatten for frontend ease
            'created_at': created_at
        }))

    @database_sync_to_async
    def is_participant(self):
        try:
            return Conversation.objects.filter(id=self.conversation_id, participants=self.user).exists()
        except:
            return False

    @database_sync_to_async
    def save_message(self, content):
        conversation = Conversation.objects.get(id=self.conversation_id)
        return Message.objects.create(conversation=conversation, sender=self.user, content=content)
