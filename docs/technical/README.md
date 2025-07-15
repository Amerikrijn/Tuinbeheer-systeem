# 🔧 Technische Documentatie

## Overzicht

Deze sectie beschrijft de technische aspecten van het Tuinbeheer Systeem voor ontwikkelaars en technische implementatie.

## 📋 Inhoud

### [Architectuur Overzicht](./architecture-overview.md)
Technische architectuur van het systeem, tech stack en componenten.

### [Database Schema](./database-schema.md)
Complete database structuur, relaties en constraints.

### [API Documentatie](./api-documentation.md)
REST API endpoints, requests/responses en authenticatie.

### [Ontwikkelaar Gids](./developer-guide.md)
Setup, development workflow en best practices.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2.16
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Language**: TypeScript

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Next.js API Routes
- **Real-time**: Supabase Realtime

### Deployment
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Environments**: Test & Production

## 🏗️ Architectuur Schema

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js App]
        B[React Components]
        C[Tailwind CSS]
    end
    
    subgraph "API Layer"
        D[Next.js API Routes]
        E[Supabase Client]
        F[Auth Middleware]
    end
    
    subgraph "Database Layer"
        G[Supabase PostgreSQL]
        H[Row Level Security]
        I[Real-time Subscriptions]
    end
    
    subgraph "Deployment"
        J[Vercel]
        K[GitHub Actions]
        L[Environment Variables]
    end
    
    A --> D
    B --> E
    D --> G
    E --> H
    A --> J
    K --> J
    J --> L
```

## 🚀 Quick Start voor Ontwikkelaars

1. **Setup**: [Lokale Development](../setup/local-development.md)
2. **Database**: [Database Setup](../setup/database-setup.md)
3. **API**: [API Documentatie](./api-documentation.md)
4. **Deployment**: [Deployment Guide](../deployment/deployment-guide.md)

## 📊 Database Schema Overzicht

```mermaid
erDiagram
    GARDENS {
        uuid id PK
        string name
        text description
        timestamp created_at
        timestamp updated_at
    }
    
    PLANT_BEDS {
        uuid id PK
        uuid garden_id FK
        string name
        text description
        string location
        decimal size_m2
        timestamp created_at
        timestamp updated_at
    }
    
    PLANTS {
        uuid id PK
        uuid plant_bed_id FK
        string name
        string species
        text description
        date planted_date
        string status
        timestamp created_at
        timestamp updated_at
    }
    
    GARDENS ||--o{ PLANT_BEDS : contains
    PLANT_BEDS ||--o{ PLANTS : contains
```

## 🔐 Beveiliging

- **Authentication**: Supabase Auth met JWT
- **Authorization**: Row Level Security (RLS)
- **Environment Variables**: Vercel Environment Variables
- **HTTPS**: Vercel SSL/TLS