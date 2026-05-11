import json
from django.shortcuts import render, redirect, get_object_or_404
from .models import Room, Reservation
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q, Case, When, Value, IntegerField
from datetime import datetime, time
import uuid
from django.core.mail import send_mail
from django import forms
from rest_framework.authtoken.models import Token

# --- WEB VIEWS ---

class SignUpForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + ('email',)


def get_token_user(request):
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if auth_header.startswith('Token '):
        token_key = auth_header.split(' ', 1)[1].strip()
        try:
            token = Token.objects.select_related('user').get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None
    return None


def landing_page(request):
    return render(request, 'landing.html')

def home(request):
    check_in = request.GET.get('check-in')
    check_out = request.GET.get('check-out')
    selected_room_type = request.GET.get('room_type')

    room_data = []
    room_types_list = [choice[0] for choice in Room.ROOM_TYPES]

    for r_type in room_types_list:
        if selected_room_type and selected_room_type != "Any Room Type" and r_type != selected_room_type:
            continue

        rooms_of_type = Room.objects.filter(room_type=r_type).exclude(status='Maintenance')
        total_count = rooms_of_type.count()

        if total_count == 0:
            continue

        booked_count = 0
        if check_in and check_out:
            try:
                # Convert strings to datetimes using the fixed policy window
                c_in = datetime.strptime(check_in, '%Y-%m-%d')
                c_out = datetime.strptime(check_out, '%Y-%m-%d')
                c_in_dt = datetime.combine(c_in.date(), time(14, 0))
                c_out_dt = datetime.combine(c_out.date(), time(12, 0))
                
                booked_count = Reservation.objects.filter(
                    room__room_type=r_type,
                    status__in=['Confirmed', 'Checked In']
                ).filter(
                    Q(check_in__lt=c_out_dt) & Q(check_out__gt=c_in_dt)
                ).values('room').distinct().count()
            except ValueError:
                pass # Fallback if date format is wrong

        sample_room = rooms_of_type.first()

        room_data.append({
            'room_type': r_type,
            'price': sample_room.price,
            'image': sample_room.image,
            'features': sample_room.features,
            'available_count': max(0, total_count - booked_count),
            'sample_id': sample_room.id,
        })

    context = {
        'room_data': room_data,
        'check_in': check_in,
        'check_out': check_out,
    }
    return render(request, 'home.html', context)

@login_required
def book_room(request, room_id):
    room_instance = get_object_or_404(Room, id=room_id)
    
    # Get dates from URL (for the initial GET request)
    check_in = request.GET.get('check_in')
    check_out = request.GET.get('check_out')

    if request.method == 'POST':
        # Capture data from HTML 'name' attributes
        g_name = request.POST.get('guest_name')
        g_contact = request.POST.get('contact')
        p_method = request.POST.get('payment_method')
        p_ref = request.POST.get('payment_reference')
        receipt = request.FILES.get('receipt_screenshot')
        
        # Capture dates from POST (if user changed them on this page)
        c_in = request.POST.get('check_in', '').strip()
        c_out = request.POST.get('check_out', '').strip()

        # Validate dates are not empty
        if not c_in or not c_out:
            messages.error(request, "Please provide valid check-in and check-out dates.")
            return redirect('book_room', room_id=room_id)

        # Validate dates are in correct format (YYYY-MM-DD)
        try:
            datetime.strptime(c_in, '%Y-%m-%d')
            datetime.strptime(c_out, '%Y-%m-%d')
        except ValueError:
            messages.error(request, "Dates must be in YYYY-MM-DD format.")
            return redirect('book_room', room_id=room_id)

        try:
            check_in_date = datetime.strptime(c_in, '%Y-%m-%d')
            check_out_date = datetime.strptime(c_out, '%Y-%m-%d')
            check_in_at = datetime.combine(check_in_date.date(), time(14, 0))
            check_out_at = datetime.combine(check_out_date.date(), time(12, 0))

            # Create the reservation
            new_reservation = Reservation.objects.create(
                user=request.user,
                room=room_instance,
                booking_id=f"BK-{uuid.uuid4().hex[:4].upper()}",
                guest_name=g_name,
                contact=g_contact,
                check_in=check_in_at,
                check_out=check_out_at,
                payment_method=p_method,
                payment_reference=p_ref,
                receipt_screenshot=receipt,
                status='Pending',
                payment_status='Under Review'
            )
            return redirect('confirmation_view', reservation_id=new_reservation.id)
            
        except Exception as e:
            messages.error(request, f"Error saving reservation: {e}")
            print(f"Error: {e}")
            return redirect('book_room', room_id=room_id)

    context = {
        'room': room_instance,
        'check_in': check_in,
        'check_out': check_out,
    }
    return render(request, 'booking_form.html', context)

@login_required
def payment_page(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id, user=request.user)
    user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
    is_mobile = any(device in user_agent for device in ['iphone', 'android', 'mobile'])
    
    return render(request, 'payment.html', {
        'reservation': reservation,
        'is_mobile': is_mobile
    })

@login_required
def upload_receipt(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id, user=request.user)
    
    if request.method == 'POST' and request.FILES.get('receipt_screenshot'):
        reservation.receipt_screenshot = request.FILES.get('receipt_screenshot')
        reservation.payment_reference = request.POST.get('reference_number')
        reservation.payment_status = 'Under Review'
        reservation.save()
        
        return render(request, 'confirmation.html', {'reservation': reservation})
    
    return redirect('payment_page', reservation_id=reservation.id)

@login_required
def user_profile(request):
    bookings = Reservation.objects.filter(user=request.user).annotate(
        status_priority=Case(
            When(status='Pending', then=Value(1)),
            When(payment_status='Under Review', then=Value(2)),
            When(status='Confirmed', then=Value(3)),
            When(status='Cancellation Pending', then=Value(4)),
            When(status='Checked In', then=Value(5)),
            When(status='Checked Out', then=Value(6)),
            When(status='Cancelled', then=Value(7)),
            output_field=IntegerField(),
        )
    ).order_by('status_priority', '-check_in')
    
    return render(request, 'profile.html', {'bookings': bookings})

@login_required
def request_cancellation(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id, user=request.user)

    if reservation.status in ['Cancelled', 'Cancellation Pending', 'Checked Out']:
        messages.warning(request, 'This booking cannot be cancelled at this stage.')
        return redirect('profile')

    reservation.status = 'Cancellation Pending'
    reservation.cancellation_requested_at = timezone.now()
    reservation.save()

    messages.success(request, 'Cancellation request submitted. If it is within 20 days of the booked date, it is non-refundable.')
    return redirect('profile')

@login_required
def confirmation_view(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id, user=request.user)
    return render(request, 'confirmation.html', {'reservation': reservation})
# --- ADMIN DASHBOARD ---

@staff_member_required(login_url='login')
def admin_dashboard(request):
    # Calculations for the dashboard cards
    context = {
        'current_date': timezone.now(),
        'total_rooms': Room.objects.count(),
        'occupied_count': Room.objects.filter(status='Occupied').count(),
        'available_count': Room.objects.filter(status='Available').count(),
        'active_reservations_count': Reservation.objects.filter(status='Confirmed').count(),
        'pending_payments_count': Reservation.objects.filter(payment_status='Under Review').count(),
        'reservations': Reservation.objects.all().order_by('-check_in')[:10],  # Limit to recent 10
        'rooms': Room.objects.all().order_by('name')[:10],  # Add rooms to context, limit to 10
    }
    return render(request, 'admin_dashboard.html', context)

@staff_member_required
def update_reservation_status(request, res_id, action):
    reservation = get_object_or_404(Reservation, id=res_id)
    
    if action == 'approve_payment':
        if reservation.status != 'Pending' or reservation.payment_status != 'Under Review':
            messages.warning(request, f"Reservation {reservation.booking_id} cannot be approved in its current state.")
        else:
            reservation.payment_status = 'Paid'
            reservation.status = 'Confirmed'
            reservation.save()
            messages.success(request, f"Payment for {reservation.booking_id} approved and booking confirmed.")
    
    elif action == 'check_in':
        if reservation.status != 'Confirmed':
            messages.warning(request, f"Reservation {reservation.booking_id} must be confirmed before check-in.")
        else:
            reservation.status = 'Checked In'
            reservation.room.status = 'Occupied'
            reservation.room.save()
            reservation.save()
            messages.success(request, f"Guest {reservation.guest_name} checked in to {reservation.room.name}.")
        
    elif action == 'check_out':
        if reservation.status != 'Checked In':
            messages.warning(request, f"Reservation {reservation.booking_id} must be checked in before checking out.")
        else:
            reservation.status = 'Checked Out'
            reservation.room.status = 'Available'
            reservation.room.save()
            reservation.save()
            messages.success(request, f"Guest {reservation.guest_name} checked out.")

    elif action == 'cancel':
        if reservation.status == 'Cancelled':
            messages.warning(request, f"Reservation {reservation.booking_id} is already cancelled.")
        else:
            reservation.status = 'Cancelled'
            reservation.room.status = 'Available'
            reservation.room.save()
            reservation.save()
            messages.warning(request, f"Reservation {reservation.booking_id} cancelled.")

    elif action == 'approve_cancellation':
        if reservation.status != 'Cancellation Pending':
            messages.warning(request, f"Reservation {reservation.booking_id} does not have a cancellation request pending.")
        else:
            reservation.status = 'Cancelled'
            reservation.room.status = 'Available'
            reservation.room.save()
            reservation.save()
            messages.success(request, f"Cancellation for {reservation.booking_id} approved.")

    reservation.save()
    return redirect('admin_dashboard')

@staff_member_required(login_url='login')
def manage_reservations_page(request):
    """Display all reservations with filtering by status"""
    status_filter = request.GET.get('status')
    
    if status_filter:
        reservations = Reservation.objects.filter(status=status_filter).order_by('-check_in')
    else:
        reservations = Reservation.objects.all().order_by('-check_in')
    
    context = {
        'reservations': reservations,
        'current_filter': status_filter,
    }
    return render(request, 'reservations_management.html', context)

@staff_member_required(login_url='login')
def manage_rooms_page(request):
    """Display all rooms with stats"""
    rooms = Room.objects.all()
    
    context = {
        'rooms': rooms,
        'total_rooms': Room.objects.count(),
        'available_count': Room.objects.filter(status='Available').count(),
        'occupied_count': Room.objects.filter(status='Occupied').count(),
        'maintenance_count': Room.objects.filter(status='Maintenance').count(),
    }
    return render(request, 'rooms_management.html', context)

@staff_member_required(login_url='login')
def manage_guests_page(request):
    """Display all guests with their booking history"""
    search_query = request.GET.get('search', '')
    
    if search_query:
        guests = User.objects.filter(
            Q(username__icontains=search_query) |
            Q(email__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query)
        ).exclude(is_staff=True)
    else:
        guests = User.objects.exclude(is_staff=True)
    
    # Add reservation count to each guest
    from django.db.models import Count
    guests = guests.annotate(reservations_count=Count('my_reservations'))
    
    active_bookings = Reservation.objects.filter(
        status__in=['Confirmed', 'Checked In']
    ).values('user').distinct().count()
    
    completed_stays = Reservation.objects.filter(
        status='Checked Out'
    ).values('user').distinct().count()
    
    context = {
        'guests': guests,
        'total_guests': User.objects.exclude(is_staff=True).count(),
        'active_bookings': active_bookings,
        'completed_stays': completed_stays,
        'staff_count': User.objects.filter(is_staff=True).count(),
    }
    return render(request, 'guests_management.html', context)

@staff_member_required(login_url='login')
def add_room(request):
    """Add a new room via form submission"""
    if request.method == 'POST':
        try:
            room = Room.objects.create(
                name=request.POST.get('name'),
                room_type=request.POST.get('room_type'),
                price=request.POST.get('price'),
                features=request.POST.get('features', ''),
                image=request.FILES.get('image', None),
                status='Available'
            )
            messages.success(request, f"Room {room.name} added successfully!")
            return redirect('manage_rooms_page')
        except Exception as e:
            messages.error(request, f"Error adding room: {e}")
            return redirect('manage_rooms_page')
    
    return redirect('manage_rooms_page')

@staff_member_required(login_url='login')
def update_room(request):
    """Update an existing room via form submission"""
    if request.method == 'POST':
        try:
            room_id = request.POST.get('room_id')
            room = get_object_or_404(Room, id=room_id)
            
            room.name = request.POST.get('name')
            room.room_type = request.POST.get('room_type')
            room.status = request.POST.get('status')
            room.price = request.POST.get('price')
            room.features = request.POST.get('features')
            room.save()
            
            messages.success(request, f"Room {room.name} updated successfully!")
            return redirect('admin_dashboard')
        except Exception as e:
            messages.error(request, f"Error updating room: {e}")
            return redirect('admin_dashboard')
    
    return redirect('admin_dashboard')

# --- AUTH & API (Remaining logic kept the same) ---

# --- AUTH VIEWS ---

def register_view(request):
    if request.method == 'POST':
        # Use our new SignUpForm instead of UserCreationForm
        form = SignUpForm(request.POST) 
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = SignUpForm()
    
    return render(request, 'register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('admin_dashboard' if user.is_staff else 'home')
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('home')

@csrf_exempt
def api_register(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        payload = json.loads(request.body.decode() or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = payload.get('email')
    password = payload.get('password')
    name = payload.get('name')
    username = payload.get('username') or email

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required'}, status=400)

    if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
        return JsonResponse({'error': 'A user with that email already exists'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    if name:
        user.first_name = name
        user.save()

    token, _ = Token.objects.get_or_create(user=user)
    return JsonResponse({'token': token.key, 'user': {'id': user.id, 'email': user.email}})


@csrf_exempt
def api_login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        payload = json.loads(request.body.decode() or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    username_or_email = payload.get('username') or payload.get('email')
    password = payload.get('password')

    if not username_or_email or not password:
        return JsonResponse({'error': 'Email and password are required'}, status=400)

    user = authenticate(request, username=username_or_email, password=password)
    if user is None and '@' in username_or_email:
        try:
            existing = User.objects.get(email=username_or_email)
            user = authenticate(request, username=existing.username, password=password)
        except User.DoesNotExist:
            user = None

    if user is None:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

    token, _ = Token.objects.get_or_create(user=user)
    return JsonResponse({'token': token.key, 'user': {'id': user.id, 'email': user.email}})


# --- MOBILE API VIEWS ---

def api_room_list(request):
    room_types_list = [choice[0] for choice in Room.ROOM_TYPES]
    data = []

    for r_type in room_types_list:
        rooms = Room.objects.filter(room_type=r_type).exclude(status='Maintenance')
        if not rooms.exists():
            continue
            
        sample = rooms.first()
        data.append({
            'id': sample.id,
            'name': r_type,
            'room_type': r_type,
            'price': str(sample.price),
            'image': sample.image.url if sample.image else None,
            'description': sample.features,
            'available_count': rooms.filter(status='Available').count(),
        })
    return JsonResponse(data, safe=False)

def api_room_detail(request, room_id):
    try:
        room = Room.objects.get(id=room_id)
        data = {
            'id': room.id,
            'name': room.name,
            'room_type': room.room_type,
            'price': str(room.price),
            'image': room.image.url if room.image else None,
            'description': room.features,
        }
        return JsonResponse(data)
    except Room.DoesNotExist:
        return JsonResponse({'error': 'Room not found'}, status=404)

@csrf_exempt
def api_create_reservation(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    user = get_token_user(request)
    if user is None:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        room_id = request.POST.get('room_id')
        guest_name = request.POST.get('guest_name')
        contact = request.POST.get('contact')
        check_in = request.POST.get('check_in')
        check_out = request.POST.get('check_out')
        payment_method = request.POST.get('payment_method')
        payment_reference = request.POST.get('payment_reference')
        receipt_screenshot = request.FILES.get('receipt_screenshot')
        
        # Validate required fields
        if not all([room_id, guest_name, contact, check_in, check_out, payment_method, payment_reference]):
            return JsonResponse({'error': 'All fields are required'}, status=400)

        try:
            check_in_date = datetime.strptime(check_in, '%Y-%m-%d')
            check_out_date = datetime.strptime(check_out, '%Y-%m-%d')
            check_in_at = datetime.combine(check_in_date.date(), time(14, 0))
            check_out_at = datetime.combine(check_out_date.date(), time(12, 0))
        except ValueError:
            return JsonResponse({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

        if check_out_at <= check_in_at:
            return JsonResponse({'error': 'Check-out must be after check-in.'}, status=400)
        
        # Get the room
        try:
            room = Room.objects.get(id=room_id)
        except Room.DoesNotExist:
            return JsonResponse({'error': 'Room not found'}, status=404)
        
        # Create the reservation in pending state
        reservation = Reservation.objects.create(
            user=user,
            room=room,
            booking_id=f"BK-{uuid.uuid4().hex[:4].upper()}",
            guest_name=guest_name,
            contact=contact,
            check_in=check_in_at,
            check_out=check_out_at,
            payment_method=payment_method,
            payment_reference=payment_reference,
            receipt_screenshot=receipt_screenshot,
            status='Pending',
            payment_status='Under Review'
        )
        
        return JsonResponse({
            'id': reservation.id,
            'booking_id': reservation.booking_id,
            'status': reservation.status,
            'payment_status': reservation.payment_status,
            'total_price': str(room.price * (check_out_date - check_in_date).days),
            'message': 'Reservation created successfully'
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def api_user_reservations(request):
    user = get_token_user(request)
    if user is None:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    reservations = Reservation.objects.filter(user=user).order_by('-id')
    data = []
    for res in reservations:
        data.append({
            'id': res.id,
            'booking_id': res.booking_id,
            'room_name': res.room.name,
            'room_type': res.room.room_type,
            'check_in': res.check_in.strftime('%Y-%m-%d'),
            'check_out': res.check_out.strftime('%Y-%m-%d'),
            'guest_name': res.guest_name,
            'contact': res.contact,
            'status': res.status,
            'payment_status': res.payment_status,
            'payment_method': res.payment_method,
            'total_price': str(res.room.price * (res.check_out - res.check_in).days),
        })
    return JsonResponse(data, safe=False)

def api_reservation_detail(request, reservation_id):
    user = get_token_user(request)
    if user is None:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        reservation = Reservation.objects.get(id=reservation_id, user=user)
        data = {
            'id': reservation.id,
            'booking_id': reservation.booking_id,
            'room': {
                'id': reservation.room.id,
                'name': reservation.room.name,
                'room_type': reservation.room.room_type,
                'price': str(reservation.room.price),
                'image': reservation.room.image.url if reservation.room.image else None,
            },
            'check_in': reservation.check_in.isoformat(),
            'check_out': reservation.check_out.isoformat(),
            'guest_name': reservation.guest_name,
            'contact': reservation.contact,
            'status': reservation.status,
            'payment_status': reservation.payment_status,
            'payment_method': reservation.payment_method,
            'payment_reference': reservation.payment_reference,
            'receipt_screenshot': reservation.receipt_screenshot.url if reservation.receipt_screenshot else None,
            'nights': (reservation.check_out - reservation.check_in).days,
            'total_price': str(reservation.room.price * (reservation.check_out - reservation.check_in).days),
        }
        return JsonResponse(data)
    except Reservation.DoesNotExist:
        return JsonResponse({'error': 'Reservation not found'}, status=404)

@csrf_exempt
def api_request_cancellation(request, reservation_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    user = get_token_user(request)
    if user is None:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        reservation = Reservation.objects.get(id=reservation_id, user=user)
    except Reservation.DoesNotExist:
        return JsonResponse({'error': 'Reservation not found'}, status=404)

    if reservation.status in ['Cancelled', 'Cancellation Pending', 'Checked Out']:
        return JsonResponse({'error': 'Cancellation cannot be requested for this booking.'}, status=400)

    reservation.status = 'Cancellation Pending'
    reservation.cancellation_requested_at = timezone.now()
    reservation.save()

    return JsonResponse({
        'message': 'Cancellation request submitted.',
        'status': reservation.status,
        'policy': 'If the cancellation is within 20 days of the booked date, it is non-refundable.'
    })

@csrf_exempt
@staff_member_required
def api_approve_cancellation(request, reservation_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        reservation = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return JsonResponse({'error': 'Reservation not found'}, status=404)

    if reservation.status != 'Cancellation Pending':
        return JsonResponse({'error': 'No pending cancellation request.'}, status=400)

    reservation.status = 'Cancelled'
    reservation.room.status = 'Available'
    reservation.room.save()
    reservation.save()

    return JsonResponse({'message': 'Cancellation approved.', 'status': reservation.status})