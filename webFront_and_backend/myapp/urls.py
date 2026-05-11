from django.urls import path
from . import views

urlpatterns = [
    # This will be http://172.20.10.2:8000/api/
    path('', views.landing_page, name='api_index'), 
]