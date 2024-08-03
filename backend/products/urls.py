from django.urls import path 

from products.views import CategoryCreateView,ProductListCreateView,CategoryListView,ProductDetailViwe,SubCategoryViwe,ProductSearchView,productPostViwe

urlpatterns = [
        path('products/category/', CategoryListView.as_view(), name='product-list'),
        path('products/', ProductDetailViwe.as_view(), name='product-post'),
        path('products/<int:pk>/', ProductDetailViwe.as_view(), name='product-detail'),
        path('products/post/', productPostViwe.as_view(), name='product-post'),
        path('products/create/', ProductListCreateView.as_view(), name='product-create'),
        path('products/search/', ProductSearchView.as_view(), name='product-search'),
        path('categories/create/', CategoryCreateView.as_view(), name='category-create'),
        path('subcategories/list/', SubCategoryViwe.as_view(), name='subcategory-list'),
]