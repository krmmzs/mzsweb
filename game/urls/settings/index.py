from django.urls import path
from game.views.settings.getinfo import getinfo


urlpatterns = [
        path("getinfo/", getinfo, name="settings_getinfo")
]

