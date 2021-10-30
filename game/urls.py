from django.urls import path
from game.views import index

urlpatterns = [
        path("", index, name = "index"), #第一个参数是公网ip后的东西, index是对应的函数, name随便
]
