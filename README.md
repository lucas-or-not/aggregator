# News Aggregator

A news aggregation platform built with Laravel (backend) and React (frontend), containerized with Docker. Meilisearch is used for full-text search.

## Features

- **Multi-source News Aggregation**: Fetches articles from various news APIs
- **User Authentication**: Login and registration feature
- **Personalized Feed**: Customizable news preferences
- **Search & Filter**: Advanced article search and filtering capabilities
- **Save Articles**: Bookmark articles for later reading
- **Real-time Updates**: Automated article fetching with Laravel scheduler
- **Responsive Design**: UI built with React and Tailwind CSS

## Tech Stack

### Backend
- **Laravel 12**: PHP framework for robust API development
- **MySQL 8.0**: Primary database
- **Redis**: Caching and queue management
- **Laravel Horizon**: Queue monitoring and management
- **Meilisearch**: Full-text search engine
- **Supervisord**: Process management

### Frontend
- **React 19**: Modern JavaScript library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server

### Infrastructure
- **Docker & Docker Compose**: Containerization
- **Nginx**: Web server and reverse proxy

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/lucas-or-not/aggregator.git
cd aggregator
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

Edit both `.env` files and add your API keys to the backend part:

```env
# News API Configuration
NEWSAPI_KEY=your_newsapi_key_here
GUARDIAN_API_KEY=your_guardian_api_key_here
NYT_API_KEY=your_nyt_api_key_here

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=news_aggregator
DB_USERNAME=root
DB_PASSWORD=password

# Redis Configuration
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# Meilisearch Configuration
SCOUT_DRIVER=meilisearch
MEILISEARCH_HOST=http://meilisearch:7700
MEILISEARCH_KEY=
```

### 3. Build and Start Services

```bash
# Build and start all containers
docker-compose up -d --build
```

### 4. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8080/api
- **Meilisearch Dashboard**: http://localhost:7700
- **Laravel Horizon**: http://localhost:8080/horizon

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Articles
- `GET /api/articles/search` - Search articles
- `GET /api/articles/{id}` - Get article details
- `POST /api/articles/{id}/save` - Save article
- `DELETE /api/articles/{id}/unsave` - Unsave article
- `GET /api/articles/saved` - Get saved articles

### User Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences
- `GET /api/feed` - Get personalized feed

### Metadata
- `GET /api/sources` - Get available news sources
- `GET /api/categories` - Get article categories
- `GET /api/authors` - Get authors

## Development

### Running Tests

**Important**: Tests should be run locally, not within Docker containers, as the test database is in-memory and doesn't behave well within Docker.

```bash
# Backend tests (run locally)
cd backend
composer install  # Required before running tests
php artisan test

# Frontend tests
cd frontend
npm test
```

## Configuration

### News Sources

The application supports multiple news APIs. Configure them in your `.env` file:

1. **NewsAPI**: Get your key from [newsapi.org](https://newsapi.org)
2. **The Guardian**: Get your key from [The Guardian Open Platform](https://open-platform.theguardian.com)
3. **New York Times**: Get your key from [NYT Developer Portal](https://developer.nytimes.com)
