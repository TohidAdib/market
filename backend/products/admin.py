from django.contrib import admin
from products.models import Category, SubCategory, Product, Rating,SpecialOffer,Advertising

class InlineSubCategory(admin.TabularInline):
    model = SubCategory
    fields = ["id", "name"]
    extra = 0

class InlineProduct(admin.TabularInline):
    model = Product
    fields = ["id", "product_name", "price", "count", "created_at"]
    readonly_fields = ["created_at"] 
    extra = 0
class InlineRating(admin.TabularInline):
    model = Rating
    fields = ["id","product", "user", "score"]
    extra = 0
class InlineOffer(admin.TabularInline):
    model = SpecialOffer
    fields = ["id", "product","user","description","changed_price"]
    extra = 0

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    model = Category
    fields = ["name"]
    inlines = [InlineSubCategory]
    list_display = ["name"]
    search_fields = ["name"]

@admin.register(SpecialOffer)
class SpecialOfferAdmin(admin.ModelAdmin):
    model = SpecialOffer
    fields = ["product","user","changed_price","description"]
    list_display = ["id","product"]
    search_fields = ["user"]

@admin.register(Advertising)
class AdvertisingAdmin(admin.ModelAdmin):
    model = Advertising
    fields = ["image"]

@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    model = SubCategory
    fields = ["name", "category"]
    inlines = [InlineProduct]
    list_display = ["name", "category"]
    search_fields = ["name", "category__name"]
    list_filter = ["category"]

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    model = Product
    fields = ["user","product_name", "price", "image", "subcategory", "count", "description", "created_at"]
    readonly_fields = ["created_at"]
    list_display = ["id","product_name", "price", "count", "subcategory", "created_at"]
    search_fields = ["product_name", "subcategory__name", "subcategory__category__name"]
    list_filter = ["subcategory", "subcategory__category"]
    inlines = [InlineRating,InlineOffer]




@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    model = Rating
    fields = ["product", "user", "score"]
    list_display = ["product", "user", "score"]
    search_fields = ["product__product_name", "user__username"]
