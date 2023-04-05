from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

import urllib.request
import imghdr

from .models import *
from .forms import *


def CheckURLimage(url):
    try:
        with urllib.request.urlopen(url) as url_file:
            headers = url_file.info()
            content_type = headers.get('Content-Type')
            if content_type.startswith('image/'):
                return imghdr.what(None, url_file.read(256))
    except:
        return False


def index(request):
    auctions = auctionList.objects.all().order_by("status").values

    return render(request, "auctions/index.html", {
        "auctions": auctions
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html",
                          {"message": "Invalid username and/or password."})
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html",
                          {"message": "Passwords must match."})

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html",
                          {"message": "Username already taken."})
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


def create(request):
    if request.method == "POST":
        # Populate form with POST data
        form = items(request.POST)

        if form.is_valid():
            try:
                if float(form.cleaned_data["price"]) <= 0:
                    messages.error(request, "Price must be above $0")
            except:
                messages.error(request, "Invalid price")

            if form.cleaned_data["imageURL"] == "":
                pass
            elif not CheckURLimage(form.cleaned_data["imageURL"]):
                messages.error(request, "URL is not an image")

            if any(message.level == 40 for message in messages.get_messages(request)):
                return render(request, "auctions/create.html", {
                    "form": form,
                })
            else:
                user = User.objects.get(username=request.user)

                data = form.save(commit=False)
                
                data.owner = user
                data.highestBidder = user

                data.save()
                return HttpResponseRedirect(reverse("index"))
    else:
        form = items()
        return render(request, "auctions/create.html", {
            "form": form,
        })


def listing(request, title):
    pass


def watch_list(request):
    pass


def categories(request):
    pass