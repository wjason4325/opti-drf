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