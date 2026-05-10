from django.contrib import admin
from django.urls import path
from myapp import views  
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView

urlpatterns = [
    # Admin Interface
    path('admin/', admin.site.urls),
    
    # Core Web Pages
    path('', views.landing_page, name='landing'),
    path('explore/', views.home, name='home'),  # Matches the 'home' function in views.py
    path('book/<int:room_id>/', views.book_room, name='book_room'),
    
    # Authentication
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Custom Admin Dashboard & Management
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard/reservations/', views.manage_reservations_page, name='manage_reservations_page'),
    path('dashboard/rooms/', views.manage_rooms_page, name='manage_rooms_page'),
    path('dashboard/guests/', views.manage_guests_page, name='manage_guests_page'),
    path('dashboard/add-room-form/', views.add_room, name='add_room'),
    path('dashboard/update-room/', views.update_room, name='update_room'),
    path('dashboard/reservation/<int:res_id>/<str:action>/', views.update_reservation_status, name='update_reservation_status'),
    
    # User Profile & Booking Flow
    path('profile/', views.user_profile, name='profile'),
    path('confirmation/<int:reservation_id>/', views.confirmation_view, name='confirmation_view'),
    path('payment/<int:reservation_id>/', views.payment_page, name='payment_page'),
    path('upload-receipt/<int:reservation_id>/', views.upload_receipt, name='upload_receipt'),
    
    # Static & Media handling
    path('favicon.ico', RedirectView.as_view(url=settings.STATIC_URL + 'favicon.ico')),
    
    # Sidebar and Action Redirects
    path('dashboard/myapp/reservation/', RedirectView.as_view(url='/admin/myapp/reservation/'), name='manage_reservations'),
    path('dashboard/myapp/room/', RedirectView.as_view(url='/admin/myapp/room/'), name='manage_rooms'),
    path('dashboard/auth/user/', RedirectView.as_view(url='/admin/auth/user/'), name='guest_records'),
    
    # Direct Add Links (Redirects to Django Admin's "Add" forms)
    path('dashboard/add-room/', RedirectView.as_view(url='/admin/myapp/room/add/'), name='add_room'),
    path('dashboard/new-reservation/', RedirectView.as_view(url='/admin/myapp/reservation/add/'), name='new_reservation'),
]

# API Endpoints for Mobile/React Native
urlpatterns += [
    path('api/rooms/', views.api_room_list, name='api_room_list'),
    path('api/rooms/<int:room_id>/', views.api_room_detail, name='api_room_detail'),
    path('api/auth/register/', views.api_register, name='api_register'),
    path('api/auth/login/', views.api_login, name='api_login'),
    path('api/reservations/', views.api_create_reservation, name='api_create_reservation'),
    path('api/user/reservations/', views.api_user_reservations, name='api_user_reservations'),
    path('api/reservations/<int:reservation_id>/', views.api_reservation_detail, name='api_reservation_detail'),
]

# Development Static/Media Files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Customizing the Django Admin Branding
admin.site.site_header = "BookInn Admin"
admin.site.site_title = "BookInn Admin Portal"
admin.site.index_title = "Welcome to the BookInn Reservation System"