
Opti-DRF

A simple Django REST Framework + React application for tracking events and transactions.

Tech Stack

Django + Django REST Framework

React (Vite)

PostgreSQL

Docker & Docker Compose

Requirements

Docker Desktop

Docker Compose

Setup

Clone the repository

Create a .env file in backend/ using .env.example

Start the project:

docker compose up --build

Migrations

Run database migrations:

docker compose exec backend python manage.py makemigrations tracker
docker compose exec backend python manage.py migrate


Or use the helper script:

migrate.bat

Access

Frontend: http://localhost:5174

Backend API: http://localhost:8000

Authentication

Login is required to access the API

All /api/* endpoints are protected

Testing

Run backend tests:

docker compose exec backend pytest