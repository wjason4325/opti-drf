from rest_framework.routers import DefaultRouter
from .views import EventViewSet, TransactionViewSet

router = DefaultRouter()
router.register("events", EventViewSet)
router.register("transaction", TransactionViewSet)

urlpatterns = router.urls
