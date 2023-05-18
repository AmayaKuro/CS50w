from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    content = models.TextField()
    owner = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    likes = models.IntegerField(default=0)
    timeStamp = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    comment = models.TextField()
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="comments")
    commenter = models.ForeignKey("User", on_delete=models.CASCADE, related_name="comments")