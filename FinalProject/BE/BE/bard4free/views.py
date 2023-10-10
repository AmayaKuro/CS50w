from django.shortcuts import render

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenViewBase
from rest_framework.exceptions import ValidationError

from .models import Conversations, Responses, User
from .serializers import *


# TODO: authenticate user before allowing them to create a conversation
@api_view(['POST'])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    try:
        if serializer.is_valid(raise_exception=True):
            user = serializer.create()
            return Response(status=status.HTTP_201_CREATED)
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)


# Add addition information to the token // doen't add the user to the token
class UserAndTokenObtainPairView(TokenViewBase):
    serializer_class = UserAndTokenObtainPairSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def requestConversation(request):
    rpcids = request.GET.get('rpcids')

    if not rpcids:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    if rpcids == 'specific':
        conversation_id = request.GET.get('conversation_id')
        conversation = Conversations.objects.get(conversation_id=conversation_id)

        if conversation is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = ConversationSerializer.specific(conversation_id)

    elif rpcids == 'list':
        conversations = Conversations.objects.filter(owner=request.user)
        serializer = ConversationSerializer(conversations, many=True)
        print(serializer.data)

    return Response(serializer.data)