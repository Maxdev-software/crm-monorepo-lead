# CRM Monorepo

Full-stack CRM with FastAPI · React/TS/Tailwind · PostgreSQL · Redis · RabbitMQ (Celery) · Nginx

## Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| API        | FastAPI + SQLAlchemy + Pydantic v2      |
| Worker     | Celery 5 + RabbitMQ                     |
| Cache      | Redis (analytics, 5 min TTL)            |
| Database   | PostgreSQL 16                           |
| Frontend   | React 18 + TypeScript + Tailwind + Vite |
| Proxy      | Nginx (static dist + /api/v1/ proxy)    |

## Quick Start

```bash
docker compose up --build
```

| URL                       | Description                        |
|---------------------------|------------------------------------|
| http://localhost          | React frontend (via Nginx)         |
| http://localhost/api/v1/  | FastAPI REST API                   |
| http://localhost:15672    | RabbitMQ management (guest/guest)  |

## API Endpoints

| Method | Path                        | Description                          |
|--------|-----------------------------|--------------------------------------|
| GET    | /api/v1/health              | Health check                         |
| POST   | /api/v1/leads               | Create lead + queue email via Celery |
| GET    | /api/v1/leads               | List leads (filterable by status)    |
| GET    | /api/v1/analytics/dashboard | Dashboard analytics (Redis cached)   |

## Architecture

```
Browser
  └── Nginx :80
        ├── /           → React dist (static files)
        └── /api/v1/    → FastAPI :8000
                              ├── PostgreSQL (ORM via SQLAlchemy)
                              ├── Redis (cache + Celery result backend)
                              └── RabbitMQ ← Celery Worker
```

## Development (without Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Worker (separate terminal)
celery -A app.tasks.celery_app worker --loglevel=info

# Frontend
cd frontend
npm install && npm run dev
```
