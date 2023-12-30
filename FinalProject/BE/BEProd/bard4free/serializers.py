from typing import Any, Dict
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Conversations, Responses, User


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "password"]

    def create(self):
        username = self.validated_data["username"]
        password = self.validated_data["password"]
        user = User.objects.create_user(username=username, password=password)
        return user
    
    def createFromGoogle(self):
        username = self.validated_data["username"]
        google_id = self.validated_data["google_id"]
        self.set_unusable_password()
        
        user = User.objects.create_user(username=username, google_id=google_id)
        return user


class UserAndTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs: Dict[str, Any]) -> Dict[str, str]:
        data = super().validate(attrs)

        payload = {
            "name": self.user.username,
        }

        data.update({"user": payload})

        return data
    

class GoogleLoginSerializer(serializers.Serializer):
    def validate(self, attrs: Dict[str, Any]):
        print(attrs.get("code"))
        print(attrs.get("state"))
        print(attrs.get("username"))
        print(attrs)
        return "done"


class ResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Responses
        fields = ["response_id", "choice_id", "message", "log"]


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversations
        fields = ["conversation_id", "title"]
