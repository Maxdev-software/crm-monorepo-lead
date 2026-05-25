# CRM Monorepo

[Русский](#русский) | [English](#english)

---

## Русский

Минималистичная CRM-система для управления лидами. Проект организован в виде монорепозитория и полностью контейнеризирован.

### 🛠 Технологический стек
* **Frontend**: React, TypeScript, Vite, Tailwind CSS
* **Backend**: Python, FastAPI, SQLAlchemy, Pydantic
* **Очередь задач**: Celery, RabbitMQ, Redis
* **База данных**: PostgreSQL
* **Прокси / Веб-сервер**: Nginx

### 📁 Структура проекта
```text
crm-monorepo/
├── backend/          # API-приложение на FastAPI и Celery-воркер
├── frontend/         # SPA-приложение на React + Vite
├── nginx/            # Конфигурация маршрутизации веб-сервера (Reverse Proxy)
└── docker-compose.yml# Оркестрация всех сервисов инфраструктуры
```

### 🚀 Быстрый запуск (Docker)
Для запуска всего окружения вам нужен только установленный **Docker Desktop**.

1. Клонируйте репозиторий и перейдите в папку проекта:
   ```bash
   git clone <url-вашего-репозитория>
   cd crm-monorepo
   ```
2. Запустите сборку и развертывание контейнеров одной командой:
   ```bash
   docker compose up --build
   ```
3. Дождитесь, пока все контейнеры перейдут в статус `Healthy`.

### 🔗 Доступ к сервисам
* **Веб-интерфейс (Фронтенд)**: [http://localhost](http://localhost) (Nginx раздает React)
* **Документация API (Swagger)**: [http://localhost/api/docs](http://localhost/api/docs) (Nginx проксирует на FastAPI)
* **Прямой порт API (в обход Nginx)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## English

A minimalist CRM system for lead management. The project is organized as a monorepo and is fully containerized.

### 🛠 Tech Stack
* **Frontend**: React, TypeScript, Vite, Tailwind CSS
* **Backend**: Python, FastAPI, SQLAlchemy, Pydantic
* **Task Queue**: Celery, RabbitMQ, Redis
* **Database**: PostgreSQL
* **Proxy / Web Server**: Nginx

### 📁 Project Structure
```text
crm-monorepo/
├── backend/          # FastAPI application & Celery worker
├── frontend/         # React + Vite SPA
├── nginx/            # Web server & Reverse Proxy configuration
└── docker-compose.yml# Docker orchestration for all services
```

### 🚀 Quick Start (Docker)
You only need **Docker Desktop** installed to run the entire environment.

1. Clone the repository and navigate to the project root:
   ```bash
   git clone <your-repository-url>
   cd crm-monorepo
   ```
2. Build and start all services with a single command:
   ```bash
   docker compose up --build
   ```
3. Wait until all containers are up and `Healthy`.

### 🔗 Service Access
* **Web UI (Frontend)**: [http://localhost](http://localhost) (React served via Nginx)
* **Interactive API Docs (Swagger)**: [http://localhost/api/docs](http://localhost/api/docs) (Proxied to FastAPI)
* **Direct API Port (Bypassing Nginx)**: [http://localhost:8000/docs](http://localhost:8000/docs)
