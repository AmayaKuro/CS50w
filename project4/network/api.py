from django.urls import path, re_path, include

from . import views

urlpatterns = [
    path("newpost", views.newPost),
    path("post/<int:currentPost>", views.posts),
    path("post/following/<int:currentPost>", views.followingPosts),
    path("like", views.like),
    path("userinfo/<str:user>", views.userInfo),
    path("post/profile/<str:user>/<int:currentPost>", views.profilePost),
    path("follow/<str:user>", views.follow),
    path("like/<int:id>", views.like),
    path("editpost/<int:postId>", views.editPost),
]