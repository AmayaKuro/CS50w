
from django.urls import path, re_path, include

from . import views

urlpatterns = [
    # API paths
    path("api/", include("network.api")),
        
    # Application paths
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    re_path(r".*", views.index, name="index"),   
]
