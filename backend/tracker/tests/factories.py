import factory
from django.utils import timezone
from tracker.models import Event


class EventFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Event

    title = factory.Faker("sentence", nb_words=3)
    notes = factory.Faker("paragraph")
    set_date = factory.LazyFunction(timezone.now)
