from django.shortcuts import render

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenViewBase
from rest_framework.exceptions import ValidationError

from .g4f import ChatCompletion

from .models import Conversations, Responses, User
from .serializers import *


# TODO: authenticate user before allowing them to create a conversation
@api_view(["POST"])
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


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def requestConversation(request):
    rpcids = request.GET.get("rpcids")
    if request.method == "GET":
        if not rpcids:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    # TODO: add parent response id to the response model
    # TODO: change ConversationSerializer.specific to ResponeSerializer and return a list of responses
        if rpcids == "specific":
            conversation_id = request.GET.get("conversation_id")
            conversation = Conversations.objects.get(conversation_id=conversation_id)

            if conversation is None:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            serializer = ConversationSerializer.specific(conversation_id)

        elif rpcids == "list":
            conversations = Conversations.objects.filter(owner=request.user)
            serializer = ConversationSerializer(conversations, many=True)

        return Response(serializer.data)

    elif request.method == "POST":
        if rpcids == "create":
            messages = request.POST.get("messages")
            if not messages:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            conversation_id = request.POST.get("conversation_id") or ""

            # Check if conversation_id is valid
            if conversation_id != "":
                try:
                    conversation_key = Conversations.objects.get(conversation_id=conversation_id).id
                except:
                    return Response(status=status.HTTP_400_BAD_REQUEST)
                

            # Try 3 times to create a conversation
            for i in range(3):
                try:
                    chat = ChatCompletion.create(
                        model="palm", messages=messages, conversation_id=conversation_id
                    )
                    break
                except:
                    continue
            else:
                return Response(status=status.HTTP_408_REQUEST_TIMEOUT)


            # Prepare the data for saving conversation if new
            if not conversation_key:
                data = {
                    "conversation_id": chat["conversation_id"],
                    "title": chat["title"],
                    "owner": request.user.id,
                }

                # Save conversation before saving response
                serializer = ConversationSerializer(data=data)
                if serializer.is_valid():
                    conversation_key = serializer.save(owner=request.user).id

            # Prepare the data for saving response
            data = {
                "conversation": conversation_key,
                "response_id": chat["response_id"],
                "choice_id": chat["choice_id"],
                "title": chat["title"],
                "log": chat["log"],
            }

            serializer = ResponseSerializer(data=data)
            if serializer.is_valid():
                serializer.save(conversation=conversation)

                return Response(chat, status=status.HTTP_201_CREATED)
            
            return Response(status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
