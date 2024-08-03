from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from users.models import Information, State, City, Seller, Save,Cart,UserProfile,Paid,CartPaided,FailedProduct
from products.models import Product

class InlineInformation(admin.TabularInline):
    model = Information
    fields = ["postal_code", "national_code", "phone", "state", "city","address","is_client"]
    extra = 0

class InlineSeller(admin.TabularInline):
    model = Seller
    fields = ["shop_name","postal_code", "license_number", "national_code", "phone", "state", "city", "likes","address","is_seller"]
class InlineSave(admin.TabularInline):
    model = Save
    fields = ["user", "product"]
    extra = 0
class InlineProduct(admin.TabularInline):
    model = Product
    fields = ["id", "product_name", "price", "image", "subcategory", "count", "description"]
    extra = 0
class InlineCart(admin.TabularInline):
    model = Cart
    fields = ["id", "product","user","total_price","total_count"]
    extra = 0
class InlineCartPaided(admin.TabularInline):
    model = CartPaided
    fields = ["id", "product","user","total_price","total_count"]
    extra = 0
class InlinePaid(admin.TabularInline):
    model = Paid
    fields = ["id", "product","user","paid","state","post_id"]
    extra = 0

class AdminUser(BaseUserAdmin):
    inlines = [InlineInformation, InlineSeller,InlineSave,InlineProduct,InlineCart,InlineCartPaided,InlinePaid]

class ShapeState(admin.ModelAdmin):
    model = State
    fields = ["name"]
    list_display = ["id","name"]
    search_fields = ["name"]

class ShapeCity(admin.ModelAdmin):
    model = City
    fields = ["name","state"]
    list_display = ["id","name", "state"]
    search_fields = ["name", "state__name"]
    list_filter = ["state"]

class ShapePaid(admin.ModelAdmin):
    model = Paid
    fields = [ "product","user","seller","paid","price","total_count","state","post_id","address"]
    list_display = ["id", "product","user","paid","state","post_id"]
    search_fields = ["user", "product"]
    list_filter = ["state"]

class ShapeFailed(admin.ModelAdmin):
    model = FailedProduct
    fields = ["user","product","description","product_error","post","postId","product_false","clientId","paid"]
    list_display = ["id","user","product","created_at"]
    search_fields = ["user", "product"]
    list_filter = ["product_error","post","postId","product_false"]

@admin.register(Save)
class SaveAdmin(admin.ModelAdmin):
    model = Save
    list_display = ["user", "product", "saved_at"]
    search_fields = ["user__username", "product__product_name"]
    list_filter = ["saved_at"]
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    model = Cart
    list_display = ["id","user", "product"]
    list_filter = ["user"]
@admin.register(CartPaided)
class CartAdmin(admin.ModelAdmin):
    model = CartPaided
    list_display = ["id","user", "product"]
    list_filter = ["user"]

admin.site.unregister(User)
admin.site.register(User, AdminUser)
admin.site.register(State, ShapeState)
admin.site.register(City, ShapeCity)
admin.site.register(UserProfile)
admin.site.register(Paid,ShapePaid)
admin.site.register(FailedProduct,ShapeFailed)
