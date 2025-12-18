import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from tracker.models import Event
from .factories import EventFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(
        username="testuser",
        password="password123"
    )

@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client

#Create
@pytest.mark.django_db
def test_create_event(auth_client):
    payload = {
        "title": "Test Event",
        "notes": "Testing create",
        "set_date": "2025-12-25T12:00:00Z",
    }

    response = auth_client.post("/api/events/", payload, format="json")

    assert response.status_code == status.HTTP_201_CREATED
    assert Event.objects.count() == 1
    assert Event.objects.first().title == "Test Event"

#Read
@pytest.mark.django_db
def test_list_events(auth_client):
    EventFactory.create_batch(3)

    response = auth_client.get("/api/events/")

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 3

#Update
@pytest.mark.django_db
def test_update_event(auth_client):
    event = EventFactory()

    payload = {
        "title": "Updated Title",
        "notes": event.notes,
        "set_date": event.set_date.isoformat(),
    }

    response = auth_client.put(
        f"/api/events/{event.id}/",
        payload,
        format="json",
    )

    event.refresh_from_db()

    assert response.status_code == status.HTTP_200_OK
    assert event.title == "Updated Title"

#Delete
@pytest.mark.django_db
def test_delete_event(auth_client):
    event = EventFactory()

    response = auth_client.delete(f"/api/events/{event.id}/")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Event.objects.count() == 0

#Auth
@pytest.mark.django_db
def test_events_requires_auth(api_client):
    response = api_client.get("/api/events/")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
