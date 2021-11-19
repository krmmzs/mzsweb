from django.http import JsonResponse
from game.models.player.player import Player

def getinfo_acapp(request):
    player = Player.objects.all()[0]
    return JsonResponse({
        'result': "success",
        'usename': player.user.usename,
        'photo': player.photo,
    })

def getinfo_web(request):
    player = Player.objects.all()[0]
    return JsonResponse({
        'result': "success",
        'usename': player.user.username,
        'photo': player.photo,
    })

def getinfo(request):
    platform = request.GET.get('platfrom')
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)

