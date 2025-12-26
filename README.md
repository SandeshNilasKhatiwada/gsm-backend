# GSM Marketplace - Backend API

Production-ready REST API for multi-vendor e-commerce platform with RBAC, shop management, and admin dashboard.

## Stack

- **Node.js 20+** + **Express 4.18**
- **PostgreSQL 15+** + **Prisma 6.19**
- **JWT Authentication** + **RBAC**

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT secrets

# Setup database
npx prisma generate
npx prisma migrate dev
npm run seed

# Start server
npm run dev
```

Server runs at `http://localhost:5000`

## API Testing

Import `postman_collection.json` into Postman for complete API documentation with 100+ endpoints.

**Default Admin:**
- Email: `admin@gsm.com`
- Password: `Admin123!`

## Features

- JWT Authentication (access + refresh tokens)
- Role-Based Access Control (RBAC)
- Multi-vendor shop management
- Product & service catalog
- Order processing
- Blog/content system with comments
- Admin dashboard with statistics
- Automated shop ranking system
- User warnings & strikes
- Soft deletes

## Project Structure

```
src/
├── config/         # Database & app config
├── controllers/    # Request handlers (11)
├── services/       # Business logic (11)
├── routes/         # API routes (11)
├── middlewares/    # Auth, error handling
└── utils/          # AppError, asyncHandler

prisma/
├── schema.prisma   # Main config
└── schema/         # Multi-file models
```

## Scripts

```bash
npm run dev         # Development server
npm start           # Production server
npm test            # Run tests
npm run seed        # Seed database
```

## Database

19 tables: Users, Roles, Permissions, Shops, Products, Services, Posts, Orders, Reviews, Comments, and more.

Multi-file Prisma schema organized by domain.

## Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/gsm_db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=5000
NODE_ENV="development"
```

## License

MIT
