from django.shortcuts import render
from django.http import Http404
from markdown import markdown
from django import forms

from . import util


class Aform(forms.Form):
    input = forms.CharField(label="input", max_length=100)


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def title(request, title):
        entry = util.get_entry(title)
        if entry is None:
            raise Http404 

        return render(request, "encyclopedia/entry.html", {
            "title": title,
            "entry": markdown(util.get_entry(title))
        })

def search(request):
     form = Aform(request.GET)

     if form.is_valid():
          query = form.cleaned_data("q")
          
