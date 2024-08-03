from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from products.models import Product


class State(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class City(models.Model):
    name = models.CharField(max_length=100)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='cities')

    class Meta:
        unique_together = ('name', 'state')

    def __str__(self):
        return f'{self.name}, {self.state.name}'
    


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile',null=True,blank=True)
    password_reset_token = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return self.user.username


class Information(models.Model):
    user = models.OneToOneField(User,related_name="user", on_delete=models.CASCADE)
    address = models.TextField(default="address")
    postal_code = models.BigIntegerField()
    phone_regex = RegexValidator(regex=r'^09\d{9}$', message="Phone number must be entered in the format: '09123456789'. Up to 11 digits allowed.")
    phone = models.CharField(validators=[phone_regex], max_length=11)
    national_code = models.BigIntegerField()
    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, blank=True)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    is_client = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.user.username}'

class Seller(models.Model):
    user = models.OneToOneField(User,related_name="seller", on_delete=models.CASCADE)
    shop_name = models.CharField(max_length=120)
    license_number = models.BigIntegerField()
    phone_regex = RegexValidator(regex=r'^09\d{9}$', message="Phone number must be entered in the format: '09123456789'. Up to 11 digits allowed.")
    phone = models.CharField(validators=[phone_regex], max_length=11)
    postal_code = models.BigIntegerField()
    national_code = models.BigIntegerField()
    likes = models.PositiveBigIntegerField(default=0)
    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, blank=True)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    address = models.TextField(default="address")
    created_at = models.DateTimeField(auto_now_add=True)
    is_seller = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.user.username} - {self.shop_name}'

class Save(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_products')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} saved {self.product.product_name}"

class Cart(models.Model):
    user = models.ForeignKey(User,related_name="cart_user",on_delete=models.CASCADE)
    product = models.ForeignKey(Product,related_name="cart_product",on_delete=models.CASCADE)
    total_count = models.PositiveBigIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    orderd_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart ({self.user.username}) - Product: {self.product.product_name}"
    
class CartPaided(models.Model):
    user = models.ForeignKey(User,related_name="cart_user_paid",on_delete=models.CASCADE)
    product = models.ForeignKey(Product,related_name="cart_product_paid",on_delete=models.CASCADE)
    total_count = models.PositiveBigIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    orderd_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart ({self.user.username}) - Product: {self.product.product_name}"
    

# Paid

class Paid(models.Model):
    PRODUCT_STATE = [
        ("confirm", "در انتظار تایید فروشنده"),
        ("confirmed", "تایید شد"),
        ("post", "تحویل پست داده شد"),
        ("recived", "تحویل داده شد"),
    ]
    user = models.ForeignKey(User,related_name="paid", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    seller = models.CharField(max_length=150)
    client_addres = models.TextField(default="")
    paid = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=1,blank=True,null=True)
    total_count = models.PositiveBigIntegerField(default=1)
    state = models.CharField(max_length=150, choices=PRODUCT_STATE)
    address = models.TextField(default="")
    post_id = models.CharField(max_length=250, blank=True, null=True)
    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

# End Paid

class FailedProduct(models.Model):
    user = models.ForeignKey(User, related_name="failed", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="failed_product", on_delete=models.CASCADE)
    product_error = models.BooleanField(default=False, help_text="کالا معیوب بوده است")
    post = models.BooleanField(default=False, help_text="کالا ارسال نشده است")
    postId = models.BooleanField(default=False, help_text="بارکد نامعتبر است")
    product_false = models.BooleanField(default=False, help_text="کالای اشتباه ارسال شده است")
    clientId = models.IntegerField(default=0)
    paid = models.IntegerField(default=0)
    description = models.TextField(default="Description", blank=True, null=True)
    created_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.product.product_name}"


    



    
