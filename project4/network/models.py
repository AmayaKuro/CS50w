from django.contrib.auth.models import AbstractUser
from django.db import models
import datetime


class User(AbstractUser):
    follower = models.ManyToManyField("self")
    following = models.ManyToManyField("self")

    # TODO: Test this clean method
    def clean(self):
        # Check if the entry is already in related_entries
        if self in self.following.all():
            raise models.RestrictedError("Cannot add self to related_entries.")

    def serialize(self):
        return {
            "username": self.username,
            "follower": self.follower.count(),
            "following": self.following.count(),
        }

class Post(models.Model):
    content = models.TextField()
    owner = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    likes = models.ManyToManyField("User", related_name="likedPosts", blank=True)
    timeStamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "owner": self.owner.username,
            "likes": self.likes.count(),
            "timeStamp": self.timeStamp.timestamp(),
        }