from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    EventViewSet,
    MedicalEventViewSet,
    WorkEventViewSet,
    FinancialEventViewSet,
    TransactionViewSet,
    CreateUserView,
)

router = DefaultRouter()
router.register("events", EventViewSet, basename="event")
router.register("medical-events", MedicalEventViewSet, basename="medical-event")
router.register("work-events", WorkEventViewSet, basename="work-event")
router.register("financial-events", FinancialEventViewSet, basename="financial-event")
router.register("transactions", TransactionViewSet)

urlpatterns = [
    path("auth/register/", CreateUserView.as_view(), name="register"),
    path("", include(router.urls)),
]