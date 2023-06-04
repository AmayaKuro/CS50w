
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API url
    path("newpost", views.newPost, name="newPost"),
    path("post", views.posts, name="post"),
    path("like", views.like, name="like"),
]
