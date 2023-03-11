from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    # path("group/", views.groups, name="index"),
    path("<str:title>/", views.entry, name="entry")
]
