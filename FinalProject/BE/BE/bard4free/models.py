from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class User(AbstractUser):
    pass

#TODO: cant migrate
class Conversations(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conversations")
    conversation_id = models.CharField(max_length=64, unique=True, blank=False, null=False)


class Response(models.Model):
    response_id = models.CharField(max_length=64, unique=True, blank=False, null=False)
    choice_id = models.CharField(max_length=64, unique=True, blank=False, null=False)
    conversation = models.ForeignKey(Conversations, on_delete=models.CASCADE, related_name="responses")
    title = models.TextField()
    log = models.TextField()