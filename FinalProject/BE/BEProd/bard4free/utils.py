import re
import os

from django.conf import settings

import google_auth_oauthlib.flow
from google.oauth2 import id_token
from google.auth.transport import requests

from .g4f.typing import ChatResponse
from .serializers import ResponseSerializer


def idCheck(*args):
    for arg in args:
        if not arg or not re.match(r"(c|r|rc)_[a-z0-9]{12,18}", arg):
            return False
    return True


def saveResponse(conversation_key, message: str, chatData: ChatResponse):
    # Prepare the data to be saved
    data = {
        **chatData,
        "message": message,
    }

    serializer = ResponseSerializer(data=data)
    if serializer.is_valid():
        # Saved by passing the conversation instance to the save()
        serializer.save(conversation=conversation_key)
        return True
    return False


def getGoogleCredentials(code: str, state: str, code_verifier: str, CLIENT_ID: str):
    # Fill in the credentials to get the user info from Google
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        os.path.join(settings.BASE_DIR, "bard4free/client_secret.json"),
        scopes=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        ],
        state=state,
    )

    flow.code_verifier = code_verifier
    flow.redirect_uri = "http://bard4free.vercel.app/api/auth/callback/google"

    flow.fetch_token(code=code)

    idinfo = id_token.verify_oauth2_token(
        flow.credentials.id_token, requests.Request(), CLIENT_ID
    )

    idinfo["id_token"] = flow.credentials.id_token

    return idinfo
