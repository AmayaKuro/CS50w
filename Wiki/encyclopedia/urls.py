from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("search/", views.search, name="index"),
    path("<str:title>/", views.title, name="entry")
]
