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
    name = util.get_entry(title)

    # if none, raise 404
    if name is None:
        raise Http404
    
    else:
        # Get entry's fomatted name
        entries = util.list_entries()
        for entry in entries:
            if entry.lower() == title.lower():
                title = entry

        # Return that entry page and entry's fomatted name
        return render(request, "encyclopedia/entry.html", {
            "title": title,
            "entry": markdown(util.get_entry(title))
        })


def search(request):
    # Take user's search
    query = request.GET["q"]

    # If matched with any entry, return that entry 
    if util.get_entry(query):
        return redirect(reverse("entry", kwargs={"title": query}))
    else:
        # Initialize material for search
        entries = util.list_entries()
        matches = []

        # For every entry, check if it contain user search disregard case
        for entry in entries:
            if query.lower() in entry.lower():
                matches += [entry]

        # Return matched entry 
        return render(request, "encyclopedia/search.html", {
            "matches": matches
        })
