from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings
from django.db.models import Q
from django.core.mail import send_mail  # Added for email functionality

class Room(models.Model):
    ROOM_TYPES = [
        ('Standard', 'Standard'), 
        ('Deluxe', 'Deluxe'), 
        ('Suite', 'Suite'),
        ('Family', 'Family')
    ]
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Occupied', 'Occupied'),
        ('Maintenance', 'Maintenance'),
    ]

    name = models.CharField(max_length=100)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    features = models.CharField(max_length=250)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    image = models.ImageField(upload_to='room_images/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.room_type})"

    @staticmethod
    def get_available_count(room_type, check_in, check_out):
        total_rooms_of_type = Room.objects.filter(
            room_type=room_type
        ).exclude(status='Maintenance')

        occupied_room_ids = Reservation.objects.filter(
            room__room_type=room_type,
            status__in=['Confirmed', 'Checked In']
        ).filter(
            Q(check_in__lt=check_out) & Q(check_out__gt=check_in)
        ).values_list('room_id', flat=True)

        available_rooms = total_rooms_of_type.exclude(id__in=occupied_room_ids)
        return available_rooms.count()

class Reservation(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'), 
        ('Confirmed', 'Confirmed'),
        ('Cancellation Pending', 'Cancellation Pending'),
        ('Checked In', 'Checked In'),
        ('Checked Out', 'Checked Out'),
        ('Cancelled', 'Cancelled'),
    ]
    PAYMENT_STATUS = [
        ('Paid', 'Paid'), 
        ('Pending', 'Pending'),
        ('Under Review', 'Under Review'), 
    ]
    PAYMENT_METHODS = [
        ('GCash', 'GCash'),
        ('PayMongo', 'PayMongo'),
        ('Cash on Arrival', 'Cash on Arrival'),
        ('Credit Card', 'Credit Card'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='my_reservations',
        null=True,
        blank=True
    )
    
    booking_id = models.CharField(max_length=10, unique=True, help_text="e.g. BK-0041")
    guest_name = models.CharField(max_length=200)
    contact = models.CharField(max_length=15)
    
    room = models.ForeignKey('Room', on_delete=models.CASCADE, related_name='reservations')
    
    check_in = models.DateField()
    check_out = models.DateField()
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='GCash')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='Pending')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    
    payment_reference = models.CharField(max_length=100, null=True, blank=True)
    receipt_screenshot = models.ImageField(upload_to='receipts/', null=True, blank=True)
    cancellation_requested_at = models.DateTimeField(null=True, blank=True)

    def clean(self):
        if self.check_in and self.check_out:
            if self.check_out <= self.check_in:
                raise ValidationError("Check-out date must be after check-in date.")
            
            exists = Reservation.objects.filter(
                room=self.room,
                status__in=['Confirmed', 'Checked In']
            ).filter(
                Q(check_in__lt=self.check_out) & Q(check_out__gt=self.check_in)
            ).exclude(pk=self.pk).exists()

            if exists:
                raise ValidationError(f"Room {self.room.name} is already booked for these dates.")

    # --- NEW LOGIC START ---
    def save(self, *args, **kwargs):
        # 1. Check if this is an update (not a brand new booking)
        if self.pk:
            old_reservation = Reservation.objects.get(pk=self.pk)
            # 2. Check if status is being changed from Pending to Confirmed
            if old_reservation.status == 'Pending' and self.status == 'Confirmed':
                self.send_confirmation_email()

        super().save(*args, **kwargs)

    def send_confirmation_email(self):
        # Use the email linked to the user account
        recipient = self.user.email if self.user else None
        
        if recipient:
            subject = f"Booking Confirmed: {self.booking_id}"
            message = (
                f"Hello {self.guest_name},\n\n"
                f"We have successfully verified your payment receipt for booking {self.booking_id}.\n"
                f"Your reservation for {self.room.name} is now CONFIRMED.\n\n"
                f"Check-in: {self.check_in}\n"
                f"Check-out: {self.check_out}\n\n"
                "We look forward to seeing you!"
            )
            try:
                send_mail(
                    subject,
                    message,
                    settings.EMAIL_HOST_USER,
                    [recipient],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending email: {e}")
    # --- NEW LOGIC END ---

    def __str__(self):
        return f"{self.booking_id} - {self.guest_name}"