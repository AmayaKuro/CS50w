from django.urls import path, re_path, include

from . import views

urlpatterns = [
    path("newpost", views.newPost, name="newPost"),
    path("post", views.posts, name="post"),
    path("like", views.like, name="like"),
    path("profile", views.profile, name="profile"),
]