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


@api_view(["POST"])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    try:
        if serializer.is_valid(raise_exception=True):
            user = serializer.create()
            return Response(status=status.HTTP_201_CREATED)
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)


class UserAndTokenObtainPairView(TokenViewBase):
    serializer_class = UserAndTokenObtainPairSerializer


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def requestConversation(request):
    if request.method == "GET":
        conversations = Conversations.objects.values("conversation_id", "title").filter(
            owner=request.user
        )
        serializer = ConversationSerializer(conversations, many=True)

        return Response(serializer.data)

    elif request.method == "POST":
        messages = request.POST.get("messages")

        conversation_key = None

        # Check if input is valid
        if not messages:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        #  Create new conversation by not providing conversation_id
        try:
            chat = ChatCompletion.create(
                provider=Bard,
                messages=messages,
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Prepare the data for saving conversation
        data = {
            "conversation_id": chat["conversation_id"],
            "title": chat["title"],
        }

        # Save conversation before saving response
        serializer = ConversationSerializer(data=data)
        if serializer.is_valid():
            conversation_key = serializer.save(owner=request.user)
        else:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save response that came with the conversation
        if not saveResponse(conversation_key, chat):
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(chat, status=status.HTTP_201_CREATED)

    elif request.method == "DELETE":
        conversation_id = request.POST.get("conversation_id")
        if not idCheck(conversation_id):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            Conversations.objects.get(conversation_id=conversation_id).delete()
            # Since the conversation is deleted, the responses are deleted as well by CASCADE
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        ChatCompletion.delete(
            provider=Bard,
            conversation_id=conversation_id,
        )

        return Response(status=status.HTTP_202_ACCEPTED)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def requestResponse(request):
    if request.method == "GET":
        conversation_id = request.GET.get("conversation_id")
        if not idCheck(conversation_id):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        try:
            responses = Responses.objects.values(
                "response_id", "choice_id", "log"
            ).filter(conversation__conversation_id=conversation_id)

            if len(responses) < 1:
                raise Exception("No responses found")
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        serializer = ResponseSerializer(responses, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        messages = request.POST.get("messages")
        conversation_id = request.POST.get("conversation_id")
        response_id = request.POST.get("response_id")
        choice_id = request.POST.get("choice_id")

        # Check if input is valid
        if not messages or not idCheck(conversation_id, response_id, choice_id):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Try to get the conversation, if it doesn't exist, throw an error
        try:
            conversation_key = Conversations.objects.get(
                conversation_id=conversation_id
            )
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Fetch for the response
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

        # Save response
        if not saveResponse(conversation_key, chat):
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(chat, status=status.HTTP_201_CREATED)
