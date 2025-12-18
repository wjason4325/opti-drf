from rest_framework import serializers
from .models import (
    Event,
    MedicalEvent,
    WorkEvent,
    FinancialEvent,
    Transaction,
)
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ["user"]

class MedicalEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalEvent
        fields = "__all__"
        read_only_fields = ["user"]

class WorkEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkEvent
        fields = "__all__"
        read_only_fields = ["user"]

class FinancialEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialEvent
        fields = "__all__"
        read_only_fields = ["user"]

# --- Transaction Serializer ---
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ["user"]