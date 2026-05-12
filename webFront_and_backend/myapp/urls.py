from django.urls import path
from . import views

urlpatterns = [
    # This will be http://https://hotelrsv-web-and-mobile-tl3x.onrender.com/api/
    path('', views.landing_page, name='api_index'), 
]