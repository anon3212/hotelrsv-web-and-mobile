from django.contrib import admin
from .models import Room, Reservation  # Import your models here

# Register your models so they appear in the Admin dashboard
admin.site.register(Room)
admin.site.register(Reservation)