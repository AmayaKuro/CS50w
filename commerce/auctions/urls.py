from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create", views.create, name="create"),
    path("<int:id>", views.auction, name="auction"),
    path("comment", views.commenting, name="comment"),
    path("delete", views.delete, name="delete"),
    path("watchlist", views.watch_list, name="watchlist"),
    path("watchlist/modify", views.watchListModify),
    path("categories/", views.categories, name="categories"),
    path("categories/<str:category>", views.categoryFind, name="categoryFind"),
]
