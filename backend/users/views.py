from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle
from rest_framework.authtoken.models import Token
from users.models import Information, State, City, Save,Cart,Seller,Paid,CartPaided,FailedProduct
from users.serializers import (StateAndCitySerializer, LogInSerializer, SignInSerializer,
                                InformationSerializer, UserInformationSerializer, UserSellerSerializer,ReCaptchaSerializer,InformationSellerSerializer,
                                  ChangePasswordSerializer,CartSerializer,SavedProductSerializer,PaidGetSerializer,PaidPostSerializer,CartPaidSerializer,
                                   FailedProductPostSerializer,FailedProductGetSerializer,InformationPostSerializer )
from products.serializers import ProductSerializer,RatingSerializer,OfferSerializer,OfferGetSerializer
from products.models import SpecialOffer,Rating


class SignInView(APIView):
    throttle_classes = [UserRateThrottle]

    def post(self, request):

        recaptcha_serializer = ReCaptchaSerializer(data=request.data)
        recaptcha_serializer.is_valid(raise_exception=True)

        serializer = SignInSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogInView(APIView):
    throttle_classes = [UserRateThrottle]

    def post(self, request):

        recaptcha_serializer = ReCaptchaSerializer(data=request.data)
        recaptcha_serializer.is_valid(raise_exception=True)
        
        user = get_object_or_404(User, username=request.data["username"])
        if not user.check_password(request.data["password"]):
            return Response({"detail": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)
        token, created = Token.objects.get_or_create(user=user)
        serializer = LogInSerializer(instance=user)
        return Response({"token": token.key, "data": serializer.data}, status=status.HTTP_200_OK)
# password
""" class PasswordResetRequestView(generics.GenericAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password reset email has been sent."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PasswordResetView(generics.GenericAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = PasswordResetSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) """

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = User
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self, queryset=None):
        return self.request.user
# end password
# user information
class InformationView(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserInformationSerializer(user,context={"request":request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    def post(self,request):
        serializer = RatingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InformationPostViwe(generics.ListCreateAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = Information.objects.all()
    serializer_class = InformationPostSerializer

class InformationPostDetailViwe(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request,pk):
        user = get_object_or_404(Information,pk=pk)
        serializer = InformationPostSerializer(user)
        return Response(serializer.data,status=status.HTTP_200_OK)
    def put(self,request,pk):
        user = get_object_or_404(Information,pk=pk)
        serializer = InformationPostSerializer(user,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request,pk):
        user = get_object_or_404(Information,pk=pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    
class InformationDetailView(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request,pk):
        user = get_object_or_404(User,pk=pk)
        serializer = UserInformationSerializer(user,context={"request":request})
        return Response(serializer.data, status=status.HTTP_200_OK)
# end user information


class InformationSellerView(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSellerSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# create a seller inof
class SellerCreateViwe(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request):
        seller = get_object_or_404(Seller,user=request.user)
        serializer = InformationSellerSerializer(seller)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self,request):
        recaptcha_serializer = ReCaptchaSerializer(data=request.data)
        recaptcha_serializer.is_valid(raise_exception=True)
        
        serializer = InformationSellerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self,request):
        seller = get_object_or_404(Seller,user=request.user)
        serializer = InformationSellerSerializer(seller,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request):
        seller = get_object_or_404(Seller,user=request.user)
        seller.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
# end create a seller inof

# raite and send raite
class RatingListViwe(generics.ListCreateAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = Rating.objects.all()
    serializer_class = RatingSerializer

class RatingDetailViwe(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request,pk):
        rate = get_object_or_404(Rating,pk=pk)
        serializer = RatingSerializer(rate)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    def put(self,request,pk):
        rate = get_object_or_404(Rating,pk=pk)
        serializer = RatingSerializer(rate,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,pk):
        rate = get_object_or_404(Rating,pk=pk)
        rate.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# end raite and send raite

# create offer for product
class OfferCreateViwe(generics.ListCreateAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = SpecialOffer.objects.all()
    serializer_class = OfferSerializer

    

class OfferGetViwe(generics.ListAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = SpecialOffer.objects.all()
    serializer_class = OfferGetSerializer
    
class OfferDetailViwe(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request,pk):
        seller = get_object_or_404(SpecialOffer,user=request.user,pk=pk)
        serializer = OfferSerializer(seller)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self,request,pk):
        seller = get_object_or_404(SpecialOffer,user=request.user,pk=pk)
        serializer = OfferSerializer(seller,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,pk):
        seller = get_object_or_404(SpecialOffer,user=request.user,pk=pk)
        seller.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
# end create offer for product

# create client inof
class ClientCreateCiwe(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request):
        client = get_object_or_404(Information,user=request.user)
        serializer = InformationSerializer(client)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self,request):
        recaptcha_serializer = ReCaptchaSerializer(data=request.data)
        recaptcha_serializer.is_valid(raise_exception=True)
        
        serializer = InformationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self,request):
        client = get_object_or_404(Information,user=request.user)
        serializer = InformationSerializer(client,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request):
        client = get_object_or_404(Information,user=request.user)
        client.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
# end create client inof
#cart
class CartListViwe(generics.ListCreateAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

class CartDetailViwe(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request,pk):
        cart = get_object_or_404(Cart,pk=pk)
        serializer = CartSerializer(cart,context={"request":request})
        return Response(serializer.data,status=status.HTTP_200_OK)

    def put(self,request,pk):
        cart = get_object_or_404(Cart,pk=pk)
        serializer = CartSerializer(cart,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,pk):
        cart = get_object_or_404(Cart,pk=pk)
        cart.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
#end cart
#cart Paided
class CartPaidedListViwe(generics.ListCreateAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    
    queryset = CartPaided.objects.all()
    serializer_class = CartPaidSerializer

class CartPaidedDetailViwe(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request,pk):
        cart = get_object_or_404(CartPaided,pk=pk)
        serializer = CartPaidSerializer(cart,context={"request":request})
        return Response(serializer.data,status=status.HTTP_200_OK)

    def put(self,request,pk):
        cart = get_object_or_404(CartPaided,pk=pk)
        serializer = CartPaidSerializer(cart,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,pk):
        cart = get_object_or_404(CartPaided,pk=pk)
        cart.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
#end cart Paided

# saved products
class SavedPeoductListViwe(generics.ListCreateAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    
    queryset = Save.objects.all()
    serializer_class = SavedProductSerializer

class SavedPeoductDetailViwe(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request,pk):
        save = get_object_or_404(Save,pk=pk)
        serializer = SavedProductSerializer(save)
        return Response(serializer.data,status=status.HTTP_200_OK)

    def put(self,request,pk):
        save = get_object_or_404(Save,pk=pk)
        serializer = SavedProductSerializer(save,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self,request,pk):
        save = get_object_or_404(Save,pk=pk)
        save.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
#end saved products      

# paid

class PaidGetViwe(generics.ListAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = Paid.objects.all()
    serializer_class = PaidGetSerializer

class PaidPostViwe(generics.CreateAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = Paid.objects.all()
    serializer_class = PaidPostSerializer

class PaidDetailViwe(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request,pk):
        paid = get_object_or_404(Paid,pk=pk)
        serializer = PaidGetSerializer(paid)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    def put(self,request,pk):
        paid = get_object_or_404(Paid,pk=pk)
        serializer = PaidPostSerializer(paid,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
#end paid

# Failed Product

class FailedProductGetViwe(generics.ListAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = FailedProduct.objects.all()
    serializer_class = FailedProductGetSerializer

class FailedProductPostViwe(generics.CreateAPIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = FailedProduct.objects.all()
    serializer_class = FailedProductPostSerializer

class FailedProductDetailViwe(APIView):
    authentication_classes = [SessionAuthentication, TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request,pk):
        failed = get_object_or_404(FailedProduct,pk=pk)
        serializer = FailedProductGetSerializer(failed)
        return Response(serializer.data,status=status.HTTP_200_OK)
    
    def put(self,request,pk):
        failed = get_object_or_404(FailedProduct,pk=pk)
        serializer = FailedProductPostSerializer(failed,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

# End Failed Product

class StateWithCityView(generics.ListAPIView):

    queryset = State.objects.all()
    serializer_class = StateAndCitySerializer
