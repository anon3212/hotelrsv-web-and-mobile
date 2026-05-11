from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0005_reservation_receipt_screenshot_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservation',
            name='cancellation_requested_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='reservation',
            name='status',
            field=models.CharField(
                choices=[
                    ('Pending', 'Pending'),
                    ('Confirmed', 'Confirmed'),
                    ('Cancellation Pending', 'Cancellation Pending'),
                    ('Checked In', 'Checked In'),
                    ('Checked Out', 'Checked Out'),
                    ('Cancelled', 'Cancelled'),
                ],
                default='Pending',
                max_length=20,
            ),
        ),
    ]
