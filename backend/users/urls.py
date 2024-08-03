from django.urls import path 

from users.views import (StateWithCityView,LogInView,SignInView,InformationView,InformationSellerView,SellerCreateViwe,ClientCreateCiwe,ChangePasswordView,CartListViwe,CartDetailViwe,
                         SavedPeoductListViwe,SavedPeoductDetailViwe,OfferCreateViwe,RatingListViwe,RatingDetailViwe,OfferDetailViwe,OfferGetViwe,PaidPostViwe,PaidGetViwe,PaidDetailViwe,
                         CartPaidedDetailViwe,CartPaidedListViwe,FailedProductGetViwe,FailedProductPostViwe,FailedProductDetailViwe,InformationDetailView,InformationPostDetailViwe,InformationPostViwe)


urlpatterns = [
        path("users/signin/",SignInView.as_view(),name="signin"),
        path("users/login/",LogInView.as_view(),name="login"),
        path("users/information/",InformationView.as_view(),name="user_information"),
        path("users/information/post/",InformationPostViwe.as_view(),name="user_information_post"),
        path("users/information/put/<int:pk>/",InformationPostDetailViwe.as_view(),name="user_information_put"),
        path("users/information/<int:pk>/",InformationDetailView.as_view(),name="user_detail_information"),
        path("users/seller/",InformationSellerView.as_view(),name="user_seller"),
        path("users/saved/",SavedPeoductListViwe.as_view(),name="user_save"),
        path("users/saved/<int:pk>/",SavedPeoductDetailViwe.as_view(),name="user_one_save"),
        path("users/cart/",CartListViwe.as_view(),name="user_cart"),
        path("users/cart/<int:pk>/",CartDetailViwe.as_view(),name="user_one_cart"),
        path("users/cartpaid/",CartPaidedListViwe.as_view(),name="user_cartpaid"),
        path("users/cartpaid/<int:pk>/",CartPaidedDetailViwe.as_view(),name="user_one_cartpaid"),
        path("users/seller/create/",SellerCreateViwe.as_view(),name="user_seller_create"),
        path("users/seller/get/",OfferGetViwe.as_view(),name="user_seller_get"),
        path("users/seller/create/offer/",OfferCreateViwe.as_view(),name="user_offer_create_for_one"),
        path("users/seller/create/offer/<int:pk>/",OfferDetailViwe.as_view(),name="user_offer_create"),
        path("users/rating/",RatingListViwe.as_view(),name="user_rating"),
        path("users/rating/<int:pk>/",RatingDetailViwe.as_view(),name="user_rating_update"),
        path("state/",StateWithCityView.as_view(),name="state_city"),
        #path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
        #path('password-reset-confirm/', PasswordResetView.as_view(), name='password_reset_confirm'),
        path('change-password/', ChangePasswordView.as_view(), name='change_password'),
        path("paid/get/",PaidGetViwe.as_view(),name="paid"),
        path("paid/post/",PaidPostViwe.as_view(),name="paid_post"),
        path("paid/detail/<int:pk>/",PaidDetailViwe.as_view(),name="paid_put"),
        path("failed/get/",FailedProductGetViwe.as_view(),name="failed"),
        path("failed/post/",FailedProductPostViwe.as_view(),name="failed_post"),
        path("failed/detail/<int:pk>/",FailedProductDetailViwe.as_view(),name="failed_put"),
]