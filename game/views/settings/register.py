from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET
    username = data.get("username", "").strip() # 如果没有的话返回""
    password = data.get("password", "").strip()
    password_confirm = data.get("password_confirm", "").strip()
    if not username or not password:
        return JsonResponse({
            'result': "用户名和密码不能为空"
        })
    if password != password_confirm:
        return JsonResponse({
            'result': "密码输入不一致",
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': "用户名已存在"
        })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="https://mouzaisi.oss-cn-hangzhou.aliyuncs.com/img/django_web_ball_game/02-1.jpg?versionId=CAEQIRiBgMCuqdjx6RciIGVmMzQ4YmJlYTVjNTRmODJhODI3ODIyMDQyOWQxNWM5")
    login(request, user)
    return JsonResponse({
        'result': "success",
    })
