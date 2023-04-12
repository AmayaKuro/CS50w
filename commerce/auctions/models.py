from django.contrib.auth.models import AbstractUser

from django.db import models
from django.conf import settings


class User(AbstractUser):
    pass
    

class auctionList(models.Model):
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=256)
    price = models.FloatField()
    catagory = models.CharField(blank=True, null=True ,max_length=64)
    imageURL = models.URLField(blank=True, null=True)
    createTime = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owner")
    highestBidder = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bidder")
    status = models.BooleanField(default=True)


class comments(models.Model):
    comment = models.CharField(max_length=256)
    auctionList = models.ForeignKey(auctionList, on_delete=models.CASCADE, related_name="auctionList")
    commenter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="commenter")


class watchList(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user")
    watchList = models.ManyToManyField(auctionList, related_name="list")
