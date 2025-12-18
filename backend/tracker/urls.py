from rest_framework.routers import DefaultRouter
from .views import EventViewSet, TransactionViewSet

router = DefaultRouter()
router.register("events", EventViewSet)
router.register("transactions", TransactionViewSet)

urlpatterns = router.urls
