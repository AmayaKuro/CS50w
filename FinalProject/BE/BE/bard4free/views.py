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
from .g4f.Provider.Bard import Bard

from .models import Conversations, Responses, User
from .serializers import *
from .utils import *


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
        if rpcids == "specific":
            conversation_id = request.GET.get("conversation_id")
            if not conversation_id:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            try:
                responses = Responses.objects.values("response_id", "choice_id", "log", "conversation").filter(
                    conversation__conversation_id=conversation_id
                )
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            serializer = ResponseSerializer(responses, many=True)
            return Response(serializer.data)

        elif rpcids == "list":
            # Test values_list (delte later)
            conversations = Conversations.objects.values("conversation_id", "title").filter(owner=request.user)
            serializer = ConversationSerializer(conversations, many=True)

            return Response(serializer.data)

        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
    elif request.method == "POST":
        if rpcids == "create":
            messages = request.POST.get("messages")
            conversation_id = request.POST.get("conversation_id")
            response_id = request.POST.get("response_id")
            choice_id = request.POST.get("choice_id")

            conversation_key = None

            # Check if input is valid
            if not messages or (conversation_id and not idCheck(conversation_id, response_id, choice_id)):
                return Response(status=status.HTTP_400_BAD_REQUEST)
            
            try:
                chat = ChatCompletion.create(
                    provider=Bard,
                    messages=messages,
                    conversation_id=conversation_id,
                    response_id=response_id,
                    choice_id=choice_id,
                )
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            # Try to get the conversation, if it doesn't exist, create it
            try:
                conversation_key = Conversations.objects.values("id").get(conversation_id=conversation_id).get("id")
            except Conversations.DoesNotExist:
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
                "log": chat["log"],
            }

            serializer = ResponseSerializer(data=data)
            if serializer.is_valid():
                serializer.save()

                return Response(chat, status=status.HTTP_201_CREATED)

            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        if rpcids == "delete":
            conversation_id = request.POST.get("conversation_id")
            if not conversation_id or not idCheck(conversation_id):
                return Response(status=status.HTTP_400_BAD_REQUEST)

            try:
                Conversations.objects.filter(conversation_id=conversation_id).delete()
                Responses.objects.filter(conversation__conversation_id=conversation_id).delete()
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            
            ChatCompletion.delete(
                provider=Bard,
                conversation_id=conversation_id,
            )
            
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
