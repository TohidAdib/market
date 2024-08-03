from rest_framework import serializers
from products.models import Category, SubCategory, Product,Rating,SpecialOffer,Advertising

from django.db.models import Sum,Avg,Min,Max,Count
from decimal import Decimal

class CategoryInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]
class OfferSerializer(serializers.ModelSerializer):
    percent = serializers.SerializerMethodField()

    class Meta:
        model = SpecialOffer
        fields = ["id", "user", "product", "description", "changed_price", "percent"]
        extra_kwargs = {
            'percent': {'read_only': True},
        }

    def get_percent(self, obj):
        try:
            product_price = obj.product.price
            product_drop = Decimal(product_price) - Decimal(obj.changed_price)
            percent = (product_drop * 100) / Decimal(product_price)
            return round(percent, 2)
        except (AttributeError, TypeError, ZeroDivisionError):
            return None 
        

class SubInfoSerializer(serializers.ModelSerializer):
    category = CategoryInfoSerializer()

    class Meta:
        model = SubCategory
        fields = ["id", "name", "category"]

    def create(self, validated_data):
        category_data = validated_data.pop('category')
        category, created = Category.objects.get_or_create(**category_data)
        subcategory = SubCategory.objects.create(category=category, **validated_data)
        return subcategory

    def update(self, instance, validated_data):
        category_data = validated_data.pop('category')
        category, created = Category.objects.get_or_create(**category_data)

        instance.name = validated_data.get('name', instance.name)
        instance.category = category
        instance.save()
        return instance
    

class RatingSerializer(serializers.ModelSerializer):
    total_score = serializers.SerializerMethodField()
    average_score = serializers.SerializerMethodField()
    max_score = serializers.SerializerMethodField()
    min_score = serializers.SerializerMethodField()
    count_score = serializers.SerializerMethodField()

    class Meta:
        model = Rating
        fields = ["id","product", "user", "score", "total_score", "average_score", "max_score", "min_score", "count_score"]
        extra_kwargs = {
            'total_score': {'read_only': True},
            'average_score': {'read_only': True},
            'max_score': {'read_only': True},
            'min_score': {'read_only': True},
            'count_score': {'read_only': True},
            }

    def get_total_score(self, obj):
        product_ratings = Rating.objects.filter(product=obj.product)
        total_score = product_ratings.aggregate(Sum('score'))['score__sum']
        return total_score if total_score is not None else 0

    def get_average_score(self, obj):
        product_averages = Rating.objects.filter(product=obj.product)
        average_score = product_averages.aggregate(Avg('score'))['score__avg']
        return average_score if average_score is not None else 0.0

    def get_max_score(self, obj):
        product_max = Rating.objects.filter(product=obj.product)
        max_score = product_max.aggregate(Max('score'))['score__max']
        return max_score if max_score is not None else 0

    def get_min_score(self, obj):
        product_min = Rating.objects.filter(product=obj.product)
        min_score = product_min.aggregate(Min('score'))['score__min']
        return min_score if min_score is not None else 0

    def get_count_score(self, obj):
        product_count = Rating.objects.filter(product=obj.product)
        count_score = product_count.aggregate(Count('score'))['score__count']
        return count_score if count_score is not None else 0
    

class ProductSerializer(serializers.ModelSerializer):
    subcategory = SubInfoSerializer()
    ratings = RatingSerializer(many=True,read_only=True)
    offer = OfferSerializer(many=True,read_only=True)
    class Meta:
        model = Product
        fields = ["id","user","product_name", "price", "image", "subcategory", "count", "description", "created_at","ratings","offer"]
        extra_kwargs = {
            'ratings': {'read_only': True},
            'offer': {'read_only': True},
            'created_at': {'read_only': True},
            }
        

    def create(self, validated_data):
        subcategory_data = validated_data.pop('subcategory')
        subcategory_serializer = SubInfoSerializer(data=subcategory_data)
        subcategory_serializer.is_valid(raise_exception=True)
        subcategory = subcategory_serializer.save()

        product = Product.objects.create(subcategory=subcategory, **validated_data)
        return product

    def update(self, instance, validated_data):
        subcategory_data = validated_data.pop('subcategory')
        subcategory_serializer = SubInfoSerializer(instance.subcategory, data=subcategory_data)
        subcategory_serializer.is_valid(raise_exception=True)
        subcategory = subcategory_serializer.save()

        instance.product_name = validated_data.get('product_name', instance.product_name)
        instance.price = validated_data.get('price', instance.price)
        instance.image = validated_data.get('image', instance.image)
        instance.count = validated_data.get('count', instance.count)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        return instance

class OfferGetSerializer(serializers.ModelSerializer):
    percent = serializers.SerializerMethodField()
    product = ProductSerializer()
    class Meta:
        model = SpecialOffer
        fields = ["id", "user", "product", "description", "changed_price", "percent"]
    
    def get_percent(self, obj):
        try:
            product_price = obj.product.price
            product_drop = Decimal(product_price) - Decimal(obj.changed_price)
            percent = (product_drop * 100) / Decimal(product_price)
            return round(percent, 2)
        except (AttributeError, TypeError, ZeroDivisionError):
            return None  

class ProductPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id","user","product_name", "price", "image", "subcategory", "count", "description", "created_at"]
        


class SubCategorySerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True) 

    class Meta:
        model = SubCategory
        fields = ["id", "name", "products"]



class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)  
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "subcategories","products"]

    def validate(self, data):
        # بررسی اینکه زیر دسته وارد شده وجود دارد
        products = data.get('products')
        if not SubCategory.objects.filter(id=products.id).exists():
            raise serializers.ValidationError({"subcategory": "The specified subcategory does not exist."})
        return data

class AdvertisingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Advertising
        fields = ["id","image"]