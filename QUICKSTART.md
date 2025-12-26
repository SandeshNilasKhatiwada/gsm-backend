# Quick Start Guide

## 1. Prerequisites

- Node.js 18+ and npm installed
- PostgreSQL 14+ installed and running

## 2. Quick Setup (Automated)

### On macOS/Linux:

```bash
chmod +x setup.sh
./setup.sh
```

### On Windows (PowerShell):

```powershell
# Copy .env.example to .env
Copy-Item .env.example .env

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed
```

## 3. Manual Setup

### Step 1: Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` and update:

- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A strong random secret
- `JWT_REFRESH_SECRET` - Another strong random secret

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (will create database if it doesn't exist)
npm run prisma:migrate

# Seed database with initial data
npm run prisma:seed
```

### Step 4: Start Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

## 4. Verify Installation

### Test the API

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Login with Admin Account

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gsm.com",
    "password": "admin123"
  }'
```

## 5. Using Postman

1. Open Postman
2. Import `GSM_Marketplace_Postman_Collection.json`
3. Run the "Login" request
4. The token will auto-save and be used for all authenticated requests

## 6. Database Management

### View Data (Prisma Studio)

```bash
npm run prisma:studio
```

Opens GUI at `http://localhost:5555`

### Reset Database (⚠️ Deletes all data)

```bash
npm run prisma:reset
```

### Create New Migration

```bash
npx prisma migrate dev --name migration_name
```

## 7. Project Structure Overview

```
backend/
├── src/
│   ├── config/          # App & database config
│   ├── controllers/     # Route handlers
│   ├── services/        # Business logic
│   ├── validations/     # Zod schemas
│   ├── middlewares/     # Auth, validation, errors
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Seed script
└── .env                 # Environment variables
```

## 8. Common Issues

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3000
```

### Database Connection Error

- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists or use `createdb gsm_db`

### Migration Errors

```bash
# Reset database and rerun migrations
npm run prisma:reset
npm run prisma:migrate
```

## 9. Next Steps

1. **Change Admin Password** - Login and update via `/api/auth/change-password`
2. **Create Test Data** - Use Postman to create shops, products, etc.
3. **Review API Docs** - Check README.md for all endpoints
4. **Configure CORS** - Update CORS_ORIGIN in .env for your frontend

## 10. Development Tips

### Watch Logs

```bash
npm run dev
# Server logs will show all requests
```

### Test Endpoints

Use the included Postman collection for comprehensive API testing

### Database Inspection

```bash
npm run prisma:studio
# Visual database browser
```

## Need Help?

- Check `README.md` for detailed documentation
- Review Prisma schema for data models
- Check service files for business logic
- Validation schemas define request/response formats
