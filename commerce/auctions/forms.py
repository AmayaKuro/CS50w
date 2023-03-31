from django import forms
from .models import *


class items(forms.ModelForm):
    class Meta:
        model = auction_list
        fields = ["title", "description", "price", "catagory", "image_url"]
        widgets = {
            "description": forms.Textarea(attrs={"row": 5}),
        }
        labels = {
            "price": "Start bid",
            "image_url": "Image URL",
        }

