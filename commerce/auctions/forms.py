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


class comment(forms.ModelForm):
    class Meta:
        model = comments
        fields = ["comment", "auctionList"]
        widgets = {
            "comment": forms.Textarea(attrs={"rows": 5, "cols": 80, "id": "comment", "placeholder": "Comment..."}),
            "auctionList": forms.HiddenInput(),
        }
        labels = {
            "comment": "Add a comment:"
        }


