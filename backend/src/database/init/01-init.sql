-- Подключение к postgres базе данных
\c postgres;

-- Удаление базы данных, если она существует
DROP DATABASE IF EXISTS "video-host";

-- Создание базы данных
CREATE DATABASE "video-host";

-- Подключение к созданной базе данных
\c "video-host";

-- Создание расширения для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создание таблицы video
CREATE TABLE IF NOT EXISTS "video" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title" varchar NOT NULL,
    "description" varchar NOT NULL,
    "likes" integer DEFAULT 0,
    "dislikes" integer DEFAULT 0,
    "Comments" varchar,
    "user" varchar,
    "createdAt" timestamp DEFAULT now(),
    "videoPath" varchar,
    "thumbnailPath" varchar,
    "views" integer,
    "tags" text[] DEFAULT '{}',
    "category" varchar,
    "isPrivate" boolean DEFAULT false,
    "status" varchar DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Создание таблицы user
CREATE TABLE IF NOT EXISTS "user" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "username" varchar NOT NULL UNIQUE,
    "password" varchar NOT NULL,
    "email" varchar NOT NULL UNIQUE,
    "createdAt" timestamp DEFAULT now(),
    "avatar" varchar,
    "role" varchar DEFAULT 'user'
);

-- Создание таблицы session
CREATE TABLE IF NOT EXISTS "session" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" uuid REFERENCES "user"("id") ON DELETE CASCADE,
    "token" varchar NOT NULL,
    "userAgent" varchar,
    "ip" varchar,
    "createdAt" timestamp DEFAULT now(),
    "expiresAt" timestamp NOT NULL
);