from django.db import models

# Create your models here.
class Event(models.Model):
    title = models.CharField(max_length=255)
    set_date = models.DateTimeField(
        help_text="When the event is scheduled to occur"
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    

class MedicalEvent(Event):
    reason = models.CharField(max_length=255)
    provider = models.CharField(max_length=255, blank=True)
    medication = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Medical: {self.title}"

    
class WorkEvent(Event):
    occurrence = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Work: {self.title}"
    
class FinancialEvent(Event):
    occurrence = models.CharField(max_length=255)
    expected_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    is_recurring = models.BooleanField(default=False)

    def __str__(self):
        return f"Finance Event: {self.title}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ("income", "Income"),
        ("expense", "Expense"),
    ]
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES,
        default='expense',
    )
    notes = models.TextField(blank=True)
    transaction_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

