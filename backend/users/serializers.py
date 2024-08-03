from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import validate_email
from users.models import Information, State, City, Save, Seller,Cart,Paid,CartPaided,FailedProduct
from products.serializers import ProductSerializer
from products.models import Product
from django.db.models import Sum
import requests
from django.conf import settings
from django.core.mail import send_mail
from django.utils.crypto import get_random_string

class ReCaptchaSerializer(serializers.Serializer):
    recaptcha_response = serializers.CharField()

    def validate_recaptcha_response(self, value):
        data = {
            'secret': settings.RECAPTCHA_PRIVATE_KEY,
            'response': value
        }
        response = requests.post('https://www.google.com/recaptcha/api/siteverify', data=data)
        result = response.json()

        if not result.get('success'):
            raise serializers.ValidationError('Invalid reCAPTCHA. Please try again.')

        return value
# password
""" class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("There is no user registered with this email address.")
        return value

    def send_password_reset_email(self, user):
        token = get_random_string(length=32)
        user.profile.password_reset_token = token
        user.profile.save()

        reset_url = f"{settings.FRONTEND_URL}/reset-password/{token}/"
        send_mail(
            'Password Reset Request',
            f'Please use the following link to reset your password: {reset_url}',
            'noreply@example.com',
            [user.email],
            fail_silently=False,
        )

    def save(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        self.send_password_reset_email(user)

class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def validate_token(self, value):
        if not UserProfile.objects.filter(password_reset_token=value).exists():
            raise serializers.ValidationError("Invalid or expired token.")
        return value

    def save(self):
        token = self.validated_data['token']
        new_password = self.validated_data['new_password']
        profile = UserProfile.objects.get(password_reset_token=token)
        user = profile.user
        user.set_password(new_password)
        user.save()
        profile.password_reset_token = ""
        profile.save() """

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password2 = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value

    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
# end password


class SignInSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ["username", "first_name", "last_name" ,"email", "password", "password2"]
    
    def validate_email(self, value):
        validate_email(value)
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value
    
    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(
            username=validated_data["username"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user

class LogInSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username","first_name", "last_name" , "email", "password"]
        extra_kwargs = {'password': {'write_only': True}}

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ["id", "name"]

class CitySerializer(serializers.ModelSerializer):
    state=StateSerializer()
    class Meta:
        model = City
        fields = ["id", "name", "state"]

class CityGetSerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ["id", "name"]

class StateAndCitySerializer(serializers.ModelSerializer):
    cities = CityGetSerializer(many=True)
    class Meta:
        model = State
        fields = ["id", "name","cities"]



class SavedProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Save
        fields = ["id","product","user","saved_at"]
        extra_kwargs = {'saved_at': {'read_only': True}}

class InformationSerializer(serializers.ModelSerializer):
    state = serializers.PrimaryKeyRelatedField(queryset=State.objects.all(), required=True)
    city = serializers.PrimaryKeyRelatedField(queryset=City.objects.all(), required=True)
    
    class Meta:
        model = Information
        fields = ["id","user","postal_code", "phone", "national_code", "state", "city","address","is_client"]
        extra_kwargs = {'is_client': {'read_only': True}}
    
    def validate(self, data):
        if data['city'].state != data['state']:
            raise serializers.ValidationError("City does not belong to the selected state.")
        return data

    def create(self, validated_data):
        return Information.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
class InformationPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Information
        fields = ["id","user", "postal_code", "phone", "national_code", "state", "city","address","is_client"]
        extra_kwargs = {'is_client': {'read_only': True}}
    
class InformationGetSerializer(serializers.ModelSerializer):
    city = CitySerializer()
    
    class Meta:
        model = Information
        fields = ["id", "postal_code", "phone", "national_code", "city","address","is_client"]
        extra_kwargs = {'is_client': {'read_only': True}}
    

class InformationSellerSerializer(serializers.ModelSerializer):
    state = serializers.PrimaryKeyRelatedField(queryset=State.objects.all(), required=True)
    city = serializers.PrimaryKeyRelatedField(queryset=City.objects.all(), required=True)

    class Meta:
        model = Seller
        fields = ["id", "shop_name", "license_number", "postal_code", "phone", "national_code", "state", "city", "address", "is_seller"]
        extra_kwargs = {
            "is_seller": {"read_only": True}
        }

    def validate(self, data):
        if data['city'].state != data['state']:
            raise serializers.ValidationError("City does not belong to the selected state.")
        return data

    def create(self, validated_data):
        return Seller.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class CartSerializer(serializers.ModelSerializer):
    sum_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "user", "product", "total_price", "total_count", "sum_price"]
        extra_kwargs = {
            "sum_price": {"read_only": True},
        }
    def get_sum_price(self, obj):
        # Filter carts by the same product to calculate the total price for that product
        total_price = Cart.objects.filter(user=obj.user).aggregate(total_price_sum=Sum("total_price"))['total_price_sum']
        return total_price if total_price is not None else 0
        
class CartPaidSerializer(serializers.ModelSerializer):
    sum_price = serializers.SerializerMethodField()

    class Meta:
        model = CartPaided
        fields = ["id", "user", "product", "total_price", "total_count", "sum_price"]
        extra_kwargs = {
            "sum_price": {"read_only": True},
        }


    def get_sum_price(self, obj):
        # Filter carts by the same product to calculate the total price for that product
        total_price = Cart.objects.filter(user=obj.user).aggregate(total_price_sum=Sum("total_price"))['total_price_sum']
        return total_price if total_price is not None else 0
    
class PaidPostSerializer(serializers.ModelSerializer):
    state_display = serializers.SerializerMethodField()
    class Meta:
        model = Paid
        fields = ["id","product","user","seller","paid","price","total_count","state","post_id","state_display","address","paid_at"]
    def get_state_display(self, obj):
        return obj.get_state_display()

class FailedProductPostSerializer(serializers.ModelSerializer):
    product_error_help_text = serializers.SerializerMethodField()
    post_help_text = serializers.SerializerMethodField()
    postId_help_text = serializers.SerializerMethodField()
    product_false_help_text = serializers.SerializerMethodField()
    class Meta:
        model = FailedProduct
        fields = ["id","user","product","paid","description","product_error","product_error_help_text","post","post_help_text","postId","postId_help_text","product_false","product_false_help_text","clientId","created_at"]
        extra_kwargs = {
            "product_error_help_text": {"read_only": True},
            "post_help_text": {"read_only": True},
            "postId_help_text": {"read_only": True},
            "product_false_help_text": {"read_only": True},
        }
    def get_product_error_help_text(self, obj):
        return FailedProduct._meta.get_field('product_error').help_text

    def get_post_help_text(self, obj):
        return FailedProduct._meta.get_field('post').help_text
    
    def get_postId_help_text(self, obj):
        return FailedProduct._meta.get_field('postId').help_text

    def get_product_false_help_text(self, obj):
        return FailedProduct._meta.get_field('product_false').help_text
    

class UserInformationSerializer(serializers.ModelSerializer):
    user = InformationGetSerializer(read_only=True)
    saved_products = SavedProductSerializer(many=True)
    cart_user = CartSerializer(many=True)
    seller = InformationSellerSerializer(read_only=True)
    paid = PaidPostSerializer(many=True)
    failed = FailedProductPostSerializer(many=True)
    cart_user_paid = CartPaidSerializer(many=True,read_only=True)
    products_user = ProductSerializer(many=True)
    class Meta:
        model = User
        fields = ["id","first_name","last_name","username", "email", "user","saved_products","cart_user","seller","paid","cart_user_paid","failed","products_user"]

class UserSellerSerializer(serializers.ModelSerializer):
    seller = InformationSellerSerializer(read_only=True)
    products_user = ProductSerializer(many=True)
    class Meta:
        model = User
        fields = ["id","username", "email", "seller","products_user"]


class PaidGetSerializer(serializers.ModelSerializer):
    state_display = serializers.SerializerMethodField()
    user = UserInformationSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    class Meta:
        model = Paid
        fields = ["id","product","user","seller","paid","price","total_count","state","post_id","state_display","address","paid_at"]
    
    def get_state_display(self, obj):
        return obj.get_state_display()

class FailedProductGetSerializer(serializers.ModelSerializer):
    user = UserInformationSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    product_error_help_text = serializers.SerializerMethodField()
    post_help_text = serializers.SerializerMethodField()
    postId_help_text = serializers.SerializerMethodField()
    product_false_help_text = serializers.SerializerMethodField()
    class Meta:
        model = FailedProduct
        fields = ["id","user","product","paid","description","product_error","product_error_help_text","post","post_help_text","postId","postId_help_text","product_false","product_false_help_text","clientId","created_at"]
    def get_product_error_help_text(self, obj):
        return FailedProduct._meta.get_field('product_error').help_text

    def get_post_help_text(self, obj):
        return FailedProduct._meta.get_field('post').help_text
    
    def get_postId_help_text(self, obj):
        return FailedProduct._meta.get_field('postId').help_text

    def get_product_false_help_text(self, obj):
        return FailedProduct._meta.get_field('product_false').help_text
    






