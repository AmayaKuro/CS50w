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
    if request.user.is_authenticated:
        if request.method == "POST":
            data = json.load(request)
            user = User.objects.get(username=request.user)

            post = Post.objects.create(content=data["content"], owner=user)
            post.save()

            # TODO: render posted post as the first post like fb
            return JsonResponse({"timeStamp": post.timeStamp.timestamp()}, safe=False)
    return JsonResponse("User must log in to do that!", status=403, safe=False)


@csrf_protect
def posts(request, currentPost):
    if request.method == "GET":
        # Get posts in reverse chronological order
        posts = Post.objects.order_by(
            "-timeStamp")[currentPost: currentPost + 10]

        packet = []
        for post in posts:
            ownerShip = post.owner == request.user
            likes = post.likes.count()
            liked = request.user in post.likes.all()
            packet += [
                # Merge post dict with the rest
                dict(post.serialize(), ** {
                    "ownerShip": ownerShip,
                    "likes": likes,
                    "liked": liked,
                }) 
            ]

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
            likes = post.likes.count()
            liked = request.user in post.likes.all()
            packet += [
                # Merge post dict with the rest
                dict(post.serialize(), ** {
                    "ownerShip": ownerShip,
                    "likes": likes,
                    "liked": liked,
                }) 
            ]

        respone = {
            "posts": packet,
            "outOfPosts": len(posts) < 10,
        }

        return JsonResponse(respone, safe=False)
    
    
@csrf_protect
def followingPosts(request, currentPost):
    if request.user.is_authenticated:
        if request.method == "GET":
            # Get requested user's following list
            users = User.objects.filter(follower=request.user)

            # Get target's posts
            posts = Post.objects.filter(owner__in= users).order_by(
                "-timeStamp")[currentPost: currentPost + 10]

            packet = []
            for post in posts:
                ownerShip = post.owner == request.user
                likes = post.likes.count()
                liked = request.user in post.likes.all()
                packet += [
                    # Merge post dict with the rest
                    dict(post.serialize(), ** {
                        "ownerShip": ownerShip,
                        "likes": likes,
                        "liked": liked,
                    }) 
                ]

            respone = {
                "posts": packet,
                "outOfPosts": len(posts) < 10,
            }

            return JsonResponse(respone, safe=False)
    else:
        return JsonResponse("User must log in to do that!", status=403, safe=False)


@csrf_protect
def userInfo(request, user):
    if request.method == "GET":
        # Get user info and check if user viewing their own profile
        requestedUser = User.objects.get(username=user)

        if request.user == requestedUser:
            owner = True

        # Check if user is following the requested user
        elif request.user.is_authenticated and request.user in requestedUser.follower.all():
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

            # Check for self follow
            try:
                from django.core.exceptions import ValidationError
                userToFollow.clean(requestedUser)
            except ValidationError:
                return JsonResponse("Cannot follow yourself", status=405, safe=False)

            # Follow the requested user if not already following and vice versa
            if requestedUser in userToFollow.follower.all():
                userToFollow.follower.remove(requestedUser)
                requestedUser.following.remove(userToFollow)
            else:
                requestedUser.following.add(userToFollow)
                userToFollow.follower.add(requestedUser)

            requestedUser.save()
            userToFollow.save()
        return JsonResponse("done", safe=False)
    else:
        return JsonResponse("User must log in to do that!", status=403, safe=False)


@csrf_protect
def like(request, id):
    if request.user.is_authenticated:
        if request.method == "PUT":
            requestedUser = User.objects.get(username=request.user)
            try:
                post = Post.objects.get(id=id)
            except Post.DoesNotExist:
                return JsonResponse("Post not found", status=404, safe=False)

            # Follow the requested user if not already following and vice versa
            if requestedUser in post.likes.all():
                post.likes.remove(requestedUser)
            else:
                post.likes.add(requestedUser)

            post.save()
        return JsonResponse({"likes": post.likes.count()}, safe=False)
    else:
        return JsonResponse("Authencation Failed", status=403, safe=False)


@csrf_protect
def editPost(request, postId):
    if request.method == "PATCH":
        data = json.load(request)

        post = Post.objects.get(id=postId)
        if request.user != post.owner:
            return JsonResponse({"errors": "Authencated Failed"}, status=403, safe=False)

        post.content = data["content"]
        post.save()

        return JsonResponse({"post": post.serialize()}, safe=False) 