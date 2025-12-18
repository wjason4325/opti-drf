from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Event, Transaction
from .serializers import EventSerializer, TransactionSerializer


# Create your views here.
class EventViewSet(ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

class TransactionViewSet(ModelViewSet):
    queryset = Transaction.objects.all().order_by("-transaction_date")
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]