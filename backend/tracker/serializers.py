from rest_framework import serializers
from .models import (
    Event,
    MedicalEvent,
    WorkEvent,
    FinancialEvent,
    Transaction,
)

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"

class MedicalEventSerializer(EventSerializer):
    class Meta(EventSerializer.Meta):
        model = MedicalEvent


class WorkEventSerializer(EventSerializer):
    class Meta(EventSerializer.Meta):
        model = WorkEvent


class FinancialEventSerializer(EventSerializer):
    class Meta(EventSerializer.Meta):
        model = FinancialEvent

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"