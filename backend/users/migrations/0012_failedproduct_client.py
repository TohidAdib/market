# Generated by Django 5.0.7 on 2024-07-29 18:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_failedproduct'),
    ]

    operations = [
        migrations.AddField(
            model_name='failedproduct',
            name='client',
            field=models.IntegerField(default=0),
        ),
    ]
