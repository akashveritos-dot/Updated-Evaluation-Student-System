from django.shortcuts import render

def error_404(request, exception):
    return render(request, 'error.html', {
        'title': 'Page Not Found',
        'code': 404,
        'message': 'Sorry, the page you are looking for does not exist.'
    }, status=404)

def error_500(request):
    return render(request, 'error.html', {
        'title': 'Server Error',
        'code': 500,
        'message': 'Oops! Something went wrong on our end.'
    }, status=500)

def error_403(request, exception):
    return render(request, 'error.html', {
        'title': 'Forbidden',
        'code': 403,
        'message': 'You do not have permission to access this page.'
    }, status=403)

def error_400(request, exception):
    return render(request, 'error.html', {
        'title': 'Bad Request',
        'code': 400,
        'message': 'Bad request. Please check your input and try again.'
    }, status=400)

