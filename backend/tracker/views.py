from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import (
    Event,
    MedicalEvent,
    WorkEvent,
    FinancialEvent,
    Transaction,
    EventSeries
)
from .serializers import (
    EventSerializer,
    MedicalEventSerializer,
    WorkEventSerializer,
    FinancialEventSerializer,
    TransactionSerializer,
    UserSerializer,
    EventSeriesSerializer
)

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class BaseUserViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filter queryset to only the current user's data
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Inject the user into the save method
        serializer.save(user=self.request.user)

class EventSeriesViewSet(BaseUserViewSet):
    queryset = EventSeries.objects.all()
    serializer_class = EventSeriesSerializer

class EventViewSet(BaseUserViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

class MedicalEventViewSet(BaseUserViewSet):
    queryset = MedicalEvent.objects.all()
    serializer_class = MedicalEventSerializer

class WorkEventViewSet(BaseUserViewSet):
    queryset = WorkEvent.objects.all()
    serializer_class = WorkEventSerializer

class FinancialEventViewSet(BaseUserViewSet):
    queryset = FinancialEvent.objects.all()
    serializer_class = FinancialEventSerializer

class TransactionViewSet(BaseUserViewSet):
    queryset = Transaction.objects.all().order_by("-transaction_date")
    serializer_class = TransactionSerializer