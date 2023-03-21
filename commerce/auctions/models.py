from django.contrib.auth.models import AbstractUser

from django.db import models


class User(AbstractUser):
    pass


class auction_list(models.Model):
    name = models.CharField(max_length=64)
    price = models.IntegerField()


class comments(models.Model):
    comment = models.CharField(max_length=256)
    auction_list = models.ForeignKey(auction_list, on_delete=models.CASCADE)
    commenter = models.ForeignKey(User, on_delete=models.CASCADE)

# create relation between comments with user & auction_list with user's watchlist