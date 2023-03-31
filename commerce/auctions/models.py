from django.contrib.auth.models import AbstractUser

from django.db import models


class User(AbstractUser):
    pass
    

class auction_list(models.Model):
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=256)
    price = models.FloatField()
    catagory = models.CharField(blank=True, max_length=64)
    image_url = models.URLField(blank=True)


class comments(models.Model):
    comment = models.CharField(max_length=256)
    auction_list = models.ForeignKey(auction_list, on_delete=models.CASCADE)
    commenter = models.ForeignKey(User, on_delete=models.CASCADE)

# create relation between comments with user & auction_list with user's watchlist