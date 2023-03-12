from django.urls import path

from . import views

urlpatterns = [
    path("", lambda req: views.redirect('wiki/')),
    path("wiki/", views.index, name="index"),
    path("wiki/search/", views.search, name="search"),
    path("wiki/<str:title>/", views.title, name="entry")
]
