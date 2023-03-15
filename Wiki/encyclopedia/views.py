from django.shortcuts import render, redirect
from django.http import Http404
from django.urls import reverse
from markdown import markdown
from django import forms
from urllib.parse import unquote
import pathlib

from . import util


class entry(forms.Form):
    title = forms.CharField(label='title', max_length=100, widget=forms.TextInput(attrs={'placeholder': 'Titlle'}))
    body = forms.CharField(label='body', widget=forms.Textarea(attrs={'placeholder': 'Support Markdown !!!'}))

class edit(forms.Form):
    body = forms.CharField(label='body', widget=forms.Textarea(attrs={'placeholder': 'Support Markdown !!!'}))


def index(request):
    return render(request, "encyclopedia/index.html",{
        "entries": util.list_entries()
    })


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


def newpage(request):
    exist = False

    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = entry(request.POST)
        # check whether it's valid:
        if form.is_valid():
            titles = util.list_entries()
            # If title had existed, return true to user
            if form.cleaned_data["title"] in titles:
                exist = True
            else:
                # Create the file's path in the storage of the entries
                storage = pathlib.Path("entries", form.cleaned_data["title"] + ".md")
                with open(storage, 'w') as file:
                    # Store information of entry
                    file.write(form.cleaned_data["body"])
                
                # redirect user to the entry that user submit
                return redirect(reverse("entry", kwargs={"title": form.cleaned_data["title"]}))
            
    # if a GET (or any other method) we'll create a blank form
    else:
        form = entry()

    # Send data to user
    return render(request, "encyclopedia/newpage.html", {
            "title": "CREATE NEW PAGE",
            "form": form,
            "exist": exist,
        })


def editpage(request, title):
    # Decode UTF-8 url encoded
    title = unquote(title)
    
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = edit(request.POST)

        # check whether it's valid:
        if form.is_valid():
            # Create the file's path in the storage of the entries
            storage = pathlib.Path("entries", title + ".md")

            with open(storage, 'w') as file:
                # Store information of entry
                file.write(form.cleaned_data["body"])

            # redirect user to the entry that user submit
            return redirect(reverse("entry", kwargs={"title": title}))
            
    # if a GET (or any other method) we'll create a form that populated with old data
    else:
        data = {"body": util.get_entry(title)}
        form = edit(data)

    # Send data to user
    return render(request, "encyclopedia/editpage.html", {
            "title": "Edit Page",
            "entry": title,
            "form": form,
        })

