from typing import Any, Dict
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Conversations, Responses, User


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
    
    def create(self):
        username = self.validated_data['username']
        password = self.validated_data['password']
        user = User.objects.create_user(username=username, password=password)
        return user


class UserAndTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs: Dict[str, Any]) -> Dict[str, str]:
        data = super().validate(attrs)

        payload = {
            'name': self.user.username,
        }

        data.update({'user': payload})
        
        return data


class ResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Responses
        fields = '__all__'


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversations
        fields = '__all__'

    @staticmethod
    def specific(conversation_id):
        conversation = Conversations.objects.get(conversation_id=conversation_id)
        responses = conversation.responses.all()
        serializer = ResponseSerializer(responses, many=True)
        return serializer