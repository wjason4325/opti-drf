from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import (
    Event,
    MedicalEvent,
    WorkEvent,
    FinancialEvent,
    Transaction,
)
from .serializers import (
    EventSerializer,
    MedicalEventSerializer,
    WorkEventSerializer,
    FinancialEventSerializer,
    TransactionSerializer,
)


# Create your views here.
class EventViewSet(ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

class MedicalEventViewSet(ModelViewSet):
    queryset = MedicalEvent.objects.all()
    serializer_class = MedicalEventSerializer


class WorkEventViewSet(ModelViewSet):
    queryset = WorkEvent.objects.all()
    serializer_class = WorkEventSerializer


class FinancialEventViewSet(ModelViewSet):
    queryset = FinancialEvent.objects.all()
    serializer_class = FinancialEventSerializer


class TransactionViewSet(ModelViewSet):
    queryset = Transaction.objects.all().order_by("-transaction_date")
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]