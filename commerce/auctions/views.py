from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse


import json
import urllib.request
import imghdr

from .models import *
# find out why need "".""
from . import forms


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
    auctions = auctionList.objects.values_list(
        "id", "title", "imageURL", "price",
        "description", "createTime", "status",
    ).order_by("-status").values()

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
        # Create empty watch list for new user
        userWatchList = watchList(user=request.user)
        userWatchList.save()

        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


@login_required(login_url="login")
def create(request):
    if request.method == "POST":
        # Populate form with POST data
        form = forms.items(request.POST)

        if form.is_valid():
            try:
                if float(form.cleaned_data["price"]) < 0:
                    messages.error(
                        request, "Price must be greater or equal to $0")
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
                data = form.save(commit=False)

                data.owner = request.user
                data.highestBidder = request.user

                data.save()
                return HttpResponseRedirect(reverse("index"))
    else:
        form = forms.items()
        return render(request, "auctions/create.html", {
            "form": form,
        })


@login_required(login_url="login")
def listing(request, id):
    List = auctionList.objects.get(id=id)
    commentList = comments.objects.filter(auctionList=List)

    if request.method == "POST":
        try:
            bid = float(request.POST["bid"])
        except:
            messages.error(request, "Invalid bid!")
        else:
            if bid > List.price:
                List.price = bid
                List.highestBidder = request.user
                List.save()
            else:
                messages.error(
                    request, "Bid must be greater than previous bid!")

        return HttpResponseRedirect(reverse("listing", kwargs={"id": id}))
    else:
        commentBox = forms.comment()

        owner = List.owner.username
        highestBidder = List.highestBidder.username

        username = str(request.user)
        return render(request, "auctions/listing.html", {
            "List": List,
            "owner": owner,
            "isOwner": owner == username,
            "isHighestBidder": highestBidder == username,
            "commentBox": commentBox,
            "commentList": commentList,
        })


@login_required(login_url="login")
def commenting(request):
    if request.method == "POST":

        comment = forms.comment(request.POST)
        if comment["auctionList"] and comment["comment"]:
            comment = comment.save(commit=False)

            comment.commenter = request.user

            comment.save()

            return HttpResponseRedirect(reverse(listing, args=[request.POST["auctionList"]]))
    else:
        return HttpResponseRedirect("/")


@login_required(login_url="login")
@csrf_protect
def delete(request):
    # TODO: turn status to false
    if request.method == 'POST':
        data = json.loads(request.body)
        List = auctionList.objects.get(id=data["list"])
        if data["status"] == "close":
            if str(List.owner) == str(request.user):
                List.status = False
                List.save()
                print(List.status)
            else:
                messages.error(request, "You don't have permission to do this action!")
        else:
            messages.error(request, "Invalid request!")
    return HttpResponseRedirect(reverse(listing, args=[data["list"]]))


@login_required(login_url="login")
def watch_list(request):
    watchingList = watchList.objects.get(user=request.user).watchList.all().order_by("-status")

    return render(request, "auctions/watchlist.html", {
        "watchingList": watchingList,
    })
        

@login_required(login_url="login")
@csrf_protect
def watchListModify(request):
    if request.method == "POST":
        data = json.loads(request.body)
        respone = {}

        userWatchList = watchList.objects.get(user=request.user)
        
        # Check if watch list had request's list or not.
        checker = userWatchList.watchList.filter(pk=data["list"]).exists()
    
        try:
            # If purpose is to change and list existed in user watch list, remove list out of watch list and vice versa
            if data["purpose"] == "change":
                if checker:
                    userWatchList.watchList.remove(auctionList.objects.get(id=data["list"]))
                    respone["state"] = 0
                else:
                    userWatchList.watchList.add(auctionList.objects.get(id=data["list"]))
                    respone["state"] = 1
            # else if purpose is to check, send check result 
            else:
                if checker: 
                    respone["state"] = 1
                else: 
                    respone["state"] = 0

            respone["status"] = 1
        except:
            respone["status"] = 0
            
        return JsonResponse(respone)


def categories(request):
    pass
