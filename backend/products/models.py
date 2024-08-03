from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=150)

    def __str__(self):
        return self.name

    def product_count(self):
        return Product.objects.filter(subcategory__category=self).count()

    def total_value(self):
        return Product.objects.filter(subcategory__category=self).aggregate(total=models.Sum('price'))['total']

class SubCategory(models.Model):
    category = models.ForeignKey(Category, related_name='subcategories', on_delete=models.CASCADE)
    name = models.CharField(max_length=150)

    def __str__(self):
        return f"{self.category.name} - {self.name}"

    def product_count(self):
        return self.products.count()

class Product(models.Model):
    user = models.ForeignKey(User, related_name='products_user', on_delete=models.CASCADE,blank=True,null=True)
    product_name = models.CharField(max_length=250)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='images/', blank=True, null=True)
    subcategory = models.ForeignKey(SubCategory, related_name='products', on_delete=models.CASCADE)
    count = models.PositiveIntegerField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.product_name

# Optional: Rating model to manage product ratings
class Rating(models.Model):
    product = models.ForeignKey(Product, related_name='ratings', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.product.product_name} - {self.score}"
    
class SpecialOffer(models.Model):
    product = models.ForeignKey(Product,related_name="offer",on_delete=models.CASCADE,blank=True,null=True)
    user = models.ForeignKey(User,related_name="offer_user",on_delete=models.CASCADE,blank=True,null=True)
    changed_price = models.DecimalField(max_digits=10,decimal_places=2)
    description = models.TextField(default="Description",blank=True,null=True)

    def __str__(self):
        return f"{self.product.product_name}_{self.user.username}"
    
class Advertising(models.Model):
    image = models.ImageField(upload_to='Advertising-images/', blank=True, null=True)


