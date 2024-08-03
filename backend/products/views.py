from django.shortcuts import render,get_object_or_404

from products.models import Category,SubCategory,Product

from products.serializers import CategorySerializer,ProductSerializer,SubInfoSerializer,ProductPostSerializer

from rest_framework import status,generics
from rest_framework.response import Response
from rest_framework.views import APIView


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

# products
class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetailViwe(APIView):
    def get(self,request,pk):
        product = get_object_or_404(Product,pk=pk)
        serializer = ProductSerializer(product,context={"request":request})
        return Response(serializer.data,status=status.HTTP_200_OK)
    def post(self,request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def put(self,request,pk):
        product = get_object_or_404(Product,pk=pk)
        serializer = ProductPostSerializer(product,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request,pk):
        product = get_object_or_404(Product,pk=pk)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class productPostViwe(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductPostSerializer

class ProductSearchView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()
        query = self.request.query_params.get('q', None)
        if query is not None:
            queryset = queryset.filter(product_name__icontains=query)
        return queryset
    
# end products
    
class CategoryCreateView(APIView):
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            # ذخیره دسته‌بندی جدید
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class SubCategoryViwe(generics.ListAPIView):
    queryset = SubCategory.objects.all()
    serializer_class = SubInfoSerializer
