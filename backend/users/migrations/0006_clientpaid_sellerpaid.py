# Generated by Django 5.0.7 on 2024-07-28 07:46

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0006_advertising'),
        ('users', '0005_alter_userprofile_user'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ClientPaid',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('paid', models.BooleanField(default=False)),
                ('state', models.CharField(choices=[('confirm', 'در انتظار تایید فروشنده'), ('confirmed', 'تایید شد'), ('post', 'تحویل پست داده شد'), ('recived', 'تحویل داده شد')], max_length=150)),
                ('post_id', models.CharField(blank=True, max_length=250, null=True)),
                ('paid_at', models.DateTimeField(auto_now_add=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='client_paid_product', to='products.product')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='client_paid', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='SellerPaid',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('paid', models.BooleanField(default=False)),
                ('state', models.CharField(choices=[('confirm', 'در انتظار تایید فروشنده'), ('confirmed', 'تایید شد'), ('post', 'تحویل پست داده شد'), ('recived', 'تحویل داده شد')], max_length=150)),
                ('post_id', models.CharField(blank=True, max_length=250, null=True)),
                ('paid_at', models.DateTimeField(auto_now_add=True)),
                ('client_addres', models.TextField(default='')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='seller_paid_product', to='products.product')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='seller_paid', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
