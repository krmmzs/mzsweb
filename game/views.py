from django.http import HttpResponse

def index(request):
    line1 = '<h1 style="text-align: center">My first page</h1>'
    line2 = '<div align=center><img style="margin: 0 auto" src="http://mouzaisi.oss-cn-hangzhou.aliyuncs.com/img/Website_attachment//20211020_161005_1634830694925.jpg" style="margin: 0 auto;"></div>'
    return HttpResponse(line1 + line2)
