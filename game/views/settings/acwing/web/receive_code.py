from django.shortcuts import redirect

def receive_code(request):
    return redirect("index") # This is where the names of urls are finally used, so you could not ues Ajax to write a url
