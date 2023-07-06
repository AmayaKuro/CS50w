from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse

import json

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


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
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_protect
def newPost(request):
    if request.method == "POST":
        data = json.load(request)
        user = User.objects.get(username=request.user)

        post = Post.objects.create(content=data["content"], owner=user)
        post.save()

        # TODO: render posted post as the first post like fb
        return JsonResponse({"timeStamp": post.timeStamp.timestamp()}, safe=False)


@csrf_protect
def posts(request, currentPost):
    if request.method == "GET":
        # Get posts in reverse chronological order
        posts = Post.objects.order_by(
            "-timeStamp")[currentPost: currentPost + 10]

        packet = []
        for post in posts:
            ownerShip = post.owner == request.user
            post = post.serialize()
            packet += [{"post": post, "ownerShip": ownerShip}]

        # Build API content
        respone = {
            "posts": packet,
            "outOfPosts": len(posts) != 10,
        }

        return JsonResponse(respone, safe=False)


@csrf_protect
def profilePost(request, user, currentPost):
    if request.method == "GET":
        # Get target's posts
        posts = Post.objects.filter(owner=user).order_by(
            "-timeStamp")[currentPost: currentPost + 10]

        packet = []
        for post in posts:
            ownerShip = post.owner == request.user
            post = post.serialize()
            packet += [{"post": post, "ownerShip": ownerShip}]

        respone = {
            "posts": packet,
            "outOfPosts": len(posts) < 10,
        }

        return JsonResponse(respone, safe=False)


@csrf_protect
def userInfo(request, user):
    if request.method == "GET":
        # Get user info and check if user viewing their own profile
        requestedUser = User.objects.get(username=user)

        if request.user == requestedUser:
            owner = True

        # Check if user is following the requested user
        elif request.user.is_authenticated and user in requestedUser.follower.all():
            owner = False
            isFollowing = True
        else:
            owner = False
            isFollowing = False

        # Build API content
        respone = {
            "userInfo": requestedUser.serialize(),
            "owner": owner,
        }
        if not owner:
            respone["isFollowing"] = isFollowing

        return JsonResponse(respone, safe=False)


@csrf_protect
def follow(request, user):
    if request.user.is_authenticated:
        if request.method == "PUT":
            requestedUser = User.objects.get(username=request.user)
            userToFollow = User.objects.get(username=user)

            # Follow the requested user if not already following and vice versa
            if requestedUser in requestedUser.follower.all():
                userToFollow.follower.remove(requestedUser)
                requestedUser.following.remove(userToFollow)
            else:
                userToFollow.follower.add(requestedUser)
                requestedUser.following.add(userToFollow)

            requestedUser.save()
        return JsonResponse("done", safe=False)
    else:
        return JsonResponse("error", safe=False)

# TODO: this for later
@csrf_protect
def like(request):
    pass
#     if request.method == "POST":
#         post = Post.object


@csrf_protect
def editPost(request, postId):
    if request.method == "PATCH":
        data = json.load(request)

        post = Post.objects.get(id=postId)
        if request.user != post.owner:
            return JsonResponse({"errors": "Authencated Failed"}, status=403, safe=False)
            
        post.content = data["content"]
        post.save()

        # TODO: render posted post as the first post like fb
        return JsonResponse({"post": post.serialize()}, safe=False)
    