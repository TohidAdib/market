# Generated by Django 5.0.7 on 2024-07-31 07:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0013_rename_client_failedproduct_clientid_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='failedproduct',
            name='created_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
