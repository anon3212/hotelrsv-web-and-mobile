from django.contrib import admin
from .models import Room, Reservation

# --- ADMIN SITE BRANDING ---
admin.site.site_header = "BookInn Administrative Portal"
admin.site.site_title = "BookInn Admin"
admin.site.index_title = "Welcome to the BookInn Management System"

# --- ROOM MANAGEMENT ---
@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    """
    Streamlines room inventory. Uses 'list_editable' to change 
    availability status quickly from the main list.
    """
    # Changed 'room_number' to 'name' based on your model structure
    list_display = ('name', 'room_type', 'price', 'status')
    
    # Filtering sidebar for fast sorting
    list_filter = ('room_type', 'status')
    
    # Search functionality
    search_fields = ('name', 'room_type')
    
    # Allows updating status directly from the list view
    list_editable = ('status',)
    
    ordering = ('name',)

    class Media:
        css = {
            'all': ('css/custom_admin.css',)
        }

# --- RESERVATION MANAGEMENT ---
@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    """
    Organizes guest data and payment verification into a clean layout.
    """
    list_display = ('booking_id', 'guest_name', 'room', 'check_in', 'check_out', 'status', 'payment_status')
    list_filter = ('status', 'payment_status', 'check_in', 'room__room_type')
    search_fields = ('booking_id', 'guest_name', 'contact')
    
    fieldsets = (
        ('Guest Information', {
            'fields': ('user', 'guest_name', 'contact'),
        }),
        ('Stay Details', {
            'fields': ('room', 'booking_id', 'check_in', 'check_out', 'status'),
        }),
        ('Payment & Verification', {
            'fields': ('payment_method', 'payment_status', 'payment_reference', 'receipt_screenshot'),
            'classes': ('collapse',), 
        }),
    )

    readonly_fields = ('booking_id',)

    class Media:
        css = {
            'all': ('css/custom_admin.css',)
        }