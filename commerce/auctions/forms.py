from django import forms
from .models import *


class items(forms.ModelForm):
    class Meta:
        model = auctionList
        fields = ["title", "description", "price", "catagory", "imageURL"]
        widgets = {
            "description": forms.Textarea(attrs={"row": 5}),
        }
        labels = {
            "price": "Start bid",
            "imageURL": "Image URL",
        }

