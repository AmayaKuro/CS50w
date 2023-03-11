from django.shortcuts import render
from django.http import Http404
from markdown import markdown

from . import util


def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry(request, title):
        entry = util.get_entry(title)
        if entry is None:
            raise Http404 

        return render(request, "encyclopedia/entry.html", {
            "title": title,
            "entry": markdown(util.get_entry(title))
        })