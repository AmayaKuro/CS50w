from django.urls import path, re_path, include

from . import views

urlpatterns = [
    path("newpost", views.newPost),
    path("post/<int:currentPost>", views.posts),
    path("like", views.like),
    path("userinfo/<str:user>", views.userInfo),
    path("profile/<str:user>/<int:currentPost>", views.profilePost),
    path("follow/<str:user>", views.follow),
]