from django.shortcuts import render, redirect
from .models import Room, Reservation
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.utils import timezone

# --- ADD THIS IMPORT FOR MOBILE ---
from django.http import JsonResponse

# Your existing Web views...
def home(request):
    # Fetch all rooms from the database
    rooms = Room.objects.all()
    
    # Pass them to the template via the context dictionary
    return render(request, 'home.html', {'rooms': rooms})

@staff_member_required(login_url='login')
def admin_dashboard(request):
    total_rooms = Room.objects.count()
    occupied_count = Room.objects.filter(status='Occupied').count()
    
    context = {
        'current_date': timezone.now(),
        'total_rooms': total_rooms,
        'occupied_count': occupied_count,
        'available_count': total_rooms - occupied_count,
        'active_reservations_count': Reservation.objects.filter(status='Confirmed').count(),
        'pending_payments_count': Reservation.objects.filter(payment_status='Pending').count(),
        'reservations': Reservation.objects.all().order_by('-check_in')[:5],
    }
    return render(request, 'admin_dashboard.html', context)

def book_room(request, room_id):
    return render(request, 'booking_form.html', {'room_id': room_id})

def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST) 
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome to BookInn, {user.username}!")
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            
            if user.is_staff:
                messages.success(request, "Admin access granted.")
                return redirect('admin_dashboard')
            else:
                return redirect('home')
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    messages.info(request, "Logged out successfully.")
    return redirect('home')


# ==========================================
# MOBILE API VIEWS (Returns JSON for Expo)
# ==========================================

def api_room_list(request):
    rooms = Room.objects.all()
    data = []
    
    for room in rooms:
        # room.image.url automatically adds the MEDIA_URL (/media/)
        image_path = room.image.url if room.image else None
        
        data.append({
            'id': room.id,
            'room_type': room.room_type,
            'price': str(room.price), # Decimal to string for JSON
            'status': room.status,
            'image': image_path, # This will now be "/media/room_images/..."
        })
        
    return JsonResponse(data, safe=False)
def api_room_detail(request, room_id):
    """
    Returns details for a single room.
    """
    try:
        room = Room.objects.filter(id=room_id).values().first()
        if room:
            return JsonResponse(room, safe=True)
        return JsonResponse({'error': 'Room not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)