# Deployment Guide

This guide covers deploying the Gardening Volunteer App to various platforms.

## Prerequisites

- Node.js 18.18.0 or higher
- MySQL 8.0 or higher
- Git

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
# Database
DATABASE_URL="mysql://username:password@host:port/gardening_volunteers"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# Optional integrations
WEATHER_API_KEY="your-weather-api-key"
INSTAGRAM_ACCESS_TOKEN="your-instagram-token"
\`\`\`

## Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Database Setup on Vercel

Use PlanetScale or another MySQL provider:

1. Create a database instance
2. Run the SQL scripts in order:
   - `database/01-create-database.sql`
   - `database/02-seed-data.sql`
   - `database/03-create-views.sql`
   - `database/04-create-procedures.sql`

## Docker Deployment

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
\`\`\`

## Manual Server Deployment

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Set up MySQL database
5. Build the application: `npm run build`
6. Start the application: `npm start`

## Database Migration

When updating the database schema:

1. Create migration SQL files
2. Run them in order on your production database
3. Test thoroughly before deploying application changes

## Monitoring

Consider setting up:
- Error tracking (Sentry)
- Performance monitoring
- Database monitoring
- Uptime monitoring

## Backup Strategy

- Regular database backups
- File upload backups
- Environment variable backups
- Code repository backups
