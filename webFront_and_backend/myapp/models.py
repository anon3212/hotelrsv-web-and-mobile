from django.db import models

class Room(models.Model):
    ROOM_TYPES = [
        ('Standard', 'Standard'), 
        ('Deluxe', 'Deluxe'), 
        ('Suite', 'Suite'),
        ('Family', 'Family')
    ]
    # Added status choices to fix the earlier dashboard error
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Occupied', 'Occupied'),
        ('Maintenance', 'Maintenance'),
    ]

    name = models.CharField(max_length=100)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    features = models.CharField(max_length=250)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='rooms/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    image = models.ImageField(upload_to='room_images/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.room_type})"

class Reservation(models.Model):
    STATUS_CHOICES = [
        ('Confirmed', 'Confirmed'),
        ('Checked In', 'Checked In'),
        ('Pending', 'Pending'),
        ('Checked Out', 'Checked Out'),
    ]
    PAYMENT_STATUS = [('Paid', 'Paid'), ('Pending', 'Pending')]
    PAYMENT_METHODS = [
        ('GCash', 'GCash'),
        ('Cash on Arrival', 'Cash on Arrival'),
        ('Credit Card', 'Credit Card'),
    ]

    booking_id = models.CharField(max_length=10, unique=True, help_text="e.g. BK-0041")
    guest_name = models.CharField(max_length=200)
    contact = models.CharField(max_length=15)
    
    # We use 'myapp.Room' (string) to avoid the E300 "not installed" error
    room = models.ForeignKey('myapp.Room', on_delete=models.CASCADE)
    
    check_in = models.DateField()
    check_out = models.DateField()
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='GCash')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='Pending')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')

    def __str__(self):
        return f"{self.booking_id} - {self.guest_name}"