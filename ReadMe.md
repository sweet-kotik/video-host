# Video Host Platform

Платформа для хостинга и управления видео контентом, построенная с использованием современного стека технологий.

## Технологии

### Backend
- NestJS (Node.js фреймворк)
- TypeScript
- PostgreSQL (база данных)
- MinIO (объектное хранилище для видео файлов)
- Docker (Временно не доступен в проекте)

### Frontend
- React
- TypeScript

## Требования

- Node.js (версия 18 или выше)
- Docker и Docker Compose
- PostgreSQL
- MinIO

## Установка и запуск

### 1. Клонирование репозитория
```bash
git clone https://github.com/sweet-kotik/video-host.git
cd video-host
```

### 2. Настройка Backend

```bash
cd backend
npm install
```

Создайте файл `.env` в директории backend со следующими переменными:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/videohost
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
```

### 3. Настройка Frontend

```bash
cd frontend
npm install
```

### 4. Запуск с помощью Docker Compose (врменно не доступно)

```bash
docker-compose up -d
```

Это запустит:
- PostgreSQL
- MinIO
- Nginx
- Backend приложение
- Frontend приложение

## Разработка

### Запуск в режиме разработки

#### Backend
```bash
cd backend
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm start
```

## Структура проекта

```
video-host/
├── backend/           # NestJS backend приложение
├── frontend/          # React frontend приложение
├── nginx/            # Nginx конфигурация
├── minio-data/       # MinIO данные
└── pg-data/         # PostgreSQL данные
```



