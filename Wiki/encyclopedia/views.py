from django.shortcuts import render, redirect
from django.http import Http404
from django.urls import reverse
from markdown import markdown
from django import forms

from . import util


def index(request):
    return render(request, "encyclopedia/index.html",
                  {"entries": util.list_entries()})


def title(request, title):
    # Get matched entry
    entry = util.get_entry(title)

    # if none, raise 404
    if entry is None:
        raise Http404
    # else return that entry
    return render(request, "encyclopedia/entry.html", {
        "title": title,
        "entry": markdown(util.get_entry(title))
    })


def search(request):
    # Take user's search
    query = request.GET["q"].lower()

    # If matched with any entry, return that entry
    if util.get_entry(query):
        return redirect(reverse("entry", kwargs={"title": query}))
    else:
        # Initialize material for search
        entries = util.list_entries()
        matches = []

        # For every entry, check if it contain user search disregard case
        for entry in entries:
            if query in entry.lower():
                matches += [entry]

        # Return matched entry 
        return render(request, "encyclopedia/search.html", {
            "title": query,
            "matches": matches
        })
