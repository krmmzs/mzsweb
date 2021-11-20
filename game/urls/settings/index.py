from django.urls import path
from game.views.settings.getinfo import getinfo
from game.views.settings.login import signin

urlpatterns = [
        path("getinfo/", getinfo, name="settings_getinfo"),
        path("login/", signin, name="settings_login"),
]

