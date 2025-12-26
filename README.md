# 🛍️ GSM Multi-Vendor Marketplace - Backend API

**Complete RESTful API for a Multi-Vendor Marketplace Platform**

[![Status](https://img.shields.io/badge/status-production--ready-green)]()
[![Backend](https://img.shields.io/badge/backend-100%25-brightgreen)]()
[![API Endpoints](https://img.shields.io/badge/endpoints-100+-blue)]()
[![Database](https://img.shields.io/badge/database-19%20tables-blue)]()

A complete, production-ready backend API for a multi-vendor marketplace with RBAC, shop management, product catalog, blogging, order processing, and comprehensive admin dashboard.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Schema](#️-database-schema)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

## 🚀 Features

### Core Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control (RBAC)
- **Multi-Vendor System** - Shops with owner, staff, and follower management
- **Product & Service Catalog** - Complete CRUD with inventory management
- **Service Management** - Shop services with reviews and bookings
- **Blog/Content System** - Posts with comments, likes, and content moderation
- **Order Management** - Full order lifecycle with payment tracking
- **Shop Ranking System** - Automated ranking with points, reviews, sales multipliers
- **Comment System** - Polymorphic comments with nested replies (2 levels)
- **Admin Dashboard** - Comprehensive statistics, moderation, and activity logs
- **Content Moderation** - User warnings, blocking, and soft delete support
- **Activity Logging** - Complete audit trail of admin actions

### Advanced Features

- **100+ API Endpoints** - RESTful design with proper HTTP methods
- **Role & Permission Management** - Dynamic RBAC with granular permissions
- **Strike System** - 3 strikes = shop/user auto-block
- **Warning System** - 3 warnings = user auto-block
- **Shop Verification** - Admin approval workflow with reasons
- **Polymorphic Relations** - Reviews work across products, services, and shops
- **Automated Rankings** - Points for verification, docs, sales, reviews
- **Soft Deletes** - All entities support soft deletion

### Technical Features

- **Separation of Concerns** - Clean architecture with controllers, services, validations
- **Custom Error Handling** - AppError class with proper HTTP status codes
- **Soft Deletes** - Prisma middleware for automatic soft delete handling
- **Pagination** - Built-in pagination for all list endpoints
- **JWT Authentication** - Access + refresh tokens with httpOnly cookies
- **Database Migrations** - Prisma migration system
- **Database Seeding** - Auto-seed script for roles, permissions, and admin user
- **Multi-file Schema** - Organized Prisma schema across multiple files

---

## 🛠️ Tech Stack

### Core
- **Runtime:** Node.js 20+
- **Framework:** Express.js 4.18
- **Language:** JavaScript (ES Modules)
- **Database:** PostgreSQL 15+
- **ORM:** Prisma 6.19.1 (Multi-file schema)

### Authentication & Security
- **JWT:** jsonwebtoken
- **Password Hashing:** bcryptjs
- **Cookies:** cookie-parser
- **CORS:** cors

### Utilities
- **Logging:** morgan
- **Environment:** dotenv
- **Testing:** Jest + Supertest

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── config.js     # App configuration
│   │   └── database.js   # Prisma client & middleware
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── shop.controller.js
│   │   ├── product.controller.js
│   │   ├── post.controller.js
│   │   ├── order.controller.js
│   │   ├── service.controller.js
│   │   ├── comment.controller.js
│   │   ├── role.controller.js
│   │   ├── permission.controller.js
│   │   └── admin.controller.js
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/           # API routes (11 files + index)
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── shop.routes.js
│   │   ├── product.routes.js
│   │   ├── post.routes.js
│   │   ├── order.routes.js
│   │   ├── service.routes.js
│   │   ├── comment.routes.js
│   │   ├── role.routes.js
│   │   ├── permission.routes.js
│   │   ├── admin.routes.js
│   │   └── index.js
│   ├── services/         # Business logic (11 files)
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── shop.service.js
│   │   ├── product.service.js
│   │   ├── post.service.js
│   │   ├── order.service.js
│   │   ├── service.service.js
│   │   ├── comment.service.js
│   │   ├── role.service.js
│   │   ├── permission.service.js
│   │   └── ranking.service.js
│   ├── validations/      # Zod validation schemas
│   │   ├── auth.validation.js
│   │   ├── user.validation.js
│   │   ├── shop.validation.js
│   │   ├── product.validation.js
│   │   ├── post.validation.js
│   │   └── order.validation.js
│   ├── utils/            # Utility functions
│   │   ├── jwt.util.js
│   │   ├── slug.util.js
│   │   └── pagination.util.js
│   └── server.js         # Express app entry point
├── prisma/
│   ├── schema.prisma     # Database schema (19 models, 13 enums)
│   └── seed.js           # Database seed script
├── .env                  # Environment variables
├── .env.example          # Example env file
├── .gitignore
├── package.json
├── postman_collection.json            # Complete API collection (100+ endpoints)
├── BACKEND_COMPLETION_SUMMARY.md      # Feature completion summary
├── POSTMAN_GUIDE.md                   # Postman usage guide
└── README.md
```

---

## 🗄️ Database Schema

### Tables (19 total)

**User Management:**
- Users (with soft delete)
- Roles (with system role flag)
- Permissions (resource + action)
- Role_Permissions (many-to-many)
- User_Roles (with approval workflow)
- User_Warnings

**Shop Management:**
- Shops (with verification, ranking, strikes)
- Shop_Staff (with permissions JSON)
- Shop_Followers
- Ranking_Points
- Shop_Strikes

**Content:**
- Products
- Services
- Posts (blog/service/announcement)
- Reviews (polymorphic: product/service/shop)
- Comments (polymorphic with nested replies)

**Commerce:**
- Orders
- Order_Items

**System:**
- Activity_Logs
- **OrderItem** - Order line items
- **UserWarning** - User violations
- **ActivityLog** - Admin action logs
### Enums (13 total)

- ShopCategory, VerificationStatus, ShopStaffRole
- ProductCategory, ServiceCategory, PostType
- PostStatus, CommentStatus, ReviewRating
- OrderStatus, PaymentMethod, PaymentStatus
- WarningSeverity

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 20.0.0
PostgreSQL >= 15.0
npm >= 9.0.0
```

### Installation

1. **Clone and install**

```bash
cd backend
npm install
```

2. **Set up environment variables**

Edit `.env` with your configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gsm_marketplace"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-refresh-token-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
PORT=5000
NODE_ENV="development"
```

3. **Generate Prisma Client**

```bash
npx prisma generate
```

4. **Run database migrations**

```bash
npx prisma migrate dev
```

5. **Seed the database (optional)**

```bash
npm run seed
```

6. **Start the development server**

```bash
npm run dev
```

Server will start at: `http://localhost:5000`

---

## 📚 API Documentation

### Import Postman Collection

1. Open Postman
2. Click **Import** → **Upload Files**
3. Select `postman_collection.json`
4. Collection with 100+ endpoints will be imported

**Quick Start:**
1. Run **Register User** (saves access token automatically)
2. Run **Create Shop** (saves shop ID)
3. Run **Create Product** (saves product ID)
4. Explore all other endpoints!

📖 **Detailed Guide:** [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)

### API Endpoints Summary

| Category | Endpoints | Documentation |
|----------|-----------|---------------|
| Authentication | 6 | Login, Register, Refresh Token |
| Users | 9 | CRUD, Block, Warn, Verify |
| Shops | 15 | CRUD, Staff, Verify, Ranking |
| Products | 6 | CRUD, Stock, Reviews |
| Posts | 9 | CRUD, Like, Comments |
| Orders | 5 | Create, Track, Cancel |
| Services | 5 | CRUD, Reviews |
| Comments | 6 | CRUD, Nested Replies |
| Roles | 7 | CRUD, Permissions |
| Permissions | 6 | CRUD, Resource Groups |
| Admin | 6 | Dashboard, Moderation, Logs |

**Base URL:** `http://localhost:5000/api`

### Authentication

All protected endpoints require a Bearer token:
```http
Authorization: Bearer <access_token>
```

Access tokens are valid for 7 days. Use the refresh token endpoint to get a new access token.

---

## 🔐 Default Admin Credentials

After running the seed script:

- **Email**: admin@gsm.com
- **Password**: admin123

⚠️ **Change these credentials immediately in production!**

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users (Admin)

- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/block` - Block user
- `PUT /api/users/:id/unblock` - Unblock user
- `DELETE /api/users/:id` - Delete user (soft)
- `POST /api/users/:id/warn` - Issue warning
- `PUT /api/users/:id/verify` - Verify user

### Shops

- `POST /api/shops` - Create shop
- `GET /api/shops` - Get all shops (public)
- `GET /api/shops/:id` - Get shop details
- `PUT /api/shops/:id` - Update shop
- `DELETE /api/shops/:id` - Delete shop
- `PUT /api/shops/:id/verify` - Verify shop (admin)
- `PUT /api/shops/:id/block` - Block shop (admin)
- `POST /api/shops/:id/strike` - Issue strike (admin)
- `POST /api/shops/:id/staff` - Add staff member
- `POST /api/shops/:id/follow` - Follow shop
- `POST /api/shops/:shopId/services` - Create service
- `GET /api/shops/:shopId/services` - Get shop services

### Products

- `POST /api/products` - Create product
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PUT /api/products/:id/stock` - Update stock

### Services

- `POST /api/services` - Create service
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service details
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `POST /api/services/:id/reviews` - Add review

### Posts

- `POST /api/posts` - Create post
- `GET /api/posts` - Get all posts (public)
- `GET /api/posts/:id` - Get post details
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comments` - Add comment
- `PUT /api/posts/:id/disable` - Disable post (admin)

### Comments

- `POST /api/comments` - Create comment
- `GET /api/comments` - Get comments by entity
- `GET /api/comments/:id` - Get comment details
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `DELETE /api/comments/:id/admin` - Admin delete

### Roles & Permissions

**Roles:**
- `POST /api/roles` - Create role
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role details
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `POST /api/roles/:id/permissions` - Add permissions
- `DELETE /api/roles/:id/permissions/:permissionId` - Remove permission

**Permissions:**
- `POST /api/permissions` - Create permission
- `GET /api/permissions` - Get all permissions
- `GET /api/permissions/:id` - Get permission details
- `PUT /api/permissions/:id` - Update permission
- `DELETE /api/permissions/:id` - Delete permission
- `GET /api/permissions/grouped` - Get by resource

### Admin

- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/pending-verifications` - Pending shops
- `GET /api/admin/users` - Advanced user search
- `GET /api/admin/activity-logs` - Activity logs
- `PUT /api/admin/content/:id/disable` - Disable content
- `GET /api/admin/reports` - View reports

### Orders

- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/payment` - Update payment (admin)
- `PUT /api/orders/:id/cancel` - Cancel order

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Manual API Testing with Postman

1. **Import the collection:**
   - Open Postman
   - Click **Import** → **Upload Files**
   - Select `postman_collection.json`

2. **Test workflow:**
   - Run **Register User** request
   - Token auto-saves to collection variables
   - All authenticated requests use the token automatically
   - Test all 100+ endpoints!

📖 **Full Guide:** [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)

---

## 🔧 Available Scripts

```bash
npm run dev              # Start development server with nodemon
npm start                # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (GUI)
npm run prisma:seed      # Seed database
npm run prisma:reset     # Reset database (WARNING: deletes all data)
```

---

## 🏗️ Architecture & Patterns

### Separation of Concerns

- **Controllers** - Handle HTTP requests/responses  
- **Services** - Business logic and database operations  
- **Middleware** - Cross-cutting concerns (auth, error handling, validation)  
- **Utils** - Reusable helper functions (AppError, asyncHandler)

### Request Flow

```
Request → Auth Middleware → Controller → Service → Prisma → Database
                                          ↓
                                    Error Handler
```

### Authentication Flow

```
Register/Login → Generate JWT (access + refresh) → Store in httpOnly Cookie
                                                  ↓
Protected Routes → Verify JWT → Extract User → Authorize by Role/Permission
```

### Soft Delete Implementation

All delete operations use Prisma middleware to automatically:
- Convert `delete` to `update` with `deletedAt` timestamp
- Filter out deleted records in all queries
- Maintain data integrity and audit trail

---

## 🔒 Security Features

- **Password Hashing** - bcryptjs with 10 salt rounds
- **JWT Authentication** - Access & refresh tokens with httpOnly cookies
- **Role-Based Access Control (RBAC)** - Dynamic roles with granular permissions
- **Custom Error Handling** - AppError class with proper HTTP status codes
- **SQL Injection Protection** - Prisma parameterized queries
- **Soft Deletes** - Data retention for audit trail
- **CORS Configuration** - Configurable allowed origins
- **Input Validation** - Request body validation (validation layer ready)

---

## 📝 Environment Variables

| Variable             | Description                  | Default        | Required |
| -------------------- | ---------------------------- | -------------- | -------- |
| `PORT`               | Server port                  | 5000           | No       |
| `NODE_ENV`           | Environment                  | development    | No       |
| `DATABASE_URL`       | PostgreSQL connection string | -              | Yes      |
| `JWT_SECRET`         | JWT signing key              | -              | Yes      |
| `JWT_REFRESH_SECRET` | Refresh token key            | -              | Yes      |
| `JWT_EXPIRES_IN`     | Access token expiry          | 7d             | No       |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry     | 30d            | No       |

---
| `JWT_EXPIRE`         | Token expiration             | 7d             |
| `JWT_REFRESH_EXPIRE` | Refresh expiration           | 30d            |
| `CORS_ORIGIN`        | Allowed origins              | localhost:3000 |

## 🐛 Error Handling

All errors return consistent format:

```json
{
  "success": false,
  "message": "Error message",
  "field": "fieldName" // for validation errors
}
```

## 📊 Response Format

Success responses:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Paginated responses:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 🚀 Deployment

### Environment Variables for Production

```env
DATABASE_URL=<postgresql-connection-string>
JWT_SECRET=<strong-secret-key>
JWT_REFRESH_SECRET=<strong-refresh-secret>
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com
```

### Build for Production

```bash
# Install production dependencies only
npm install --production

# Run database migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Start production server
npm start
```

### Deployment Checklist

- ✅ Set `NODE_ENV=production`
- ✅ Use strong JWT secrets (64+ characters)
- ✅ Configure CORS properly
- ✅ Use environment variables for all secrets
- ✅ Enable HTTPS
- ✅ Set up PostgreSQL backup and replication
- ✅ Configure logging (Morgan for requests)
- ✅ Set up monitoring (PM2, New Relic, or Datadog)
- ✅ Rate limiting (express-rate-limit)
- ✅ Helmet.js for security headers

### Recommended Platforms

- **AWS** - EC2, ECS, Elastic Beanstalk
- **Azure** - App Service, Container Instances
- **Heroku** - With PostgreSQL add-on
- **DigitalOcean** - App Platform
- **Render** - Web services
- **Railway** - Full-stack deployment

---

## � Documentation

### Available Guides

1. **[POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)** - Complete Postman collection usage
2. **[BACKEND_COMPLETION_SUMMARY.md](./BACKEND_COMPLETION_SUMMARY.md)** - Feature completion status
3. **[PROJECT_COMPLETION_TALLY.md](./PROJECT_COMPLETION_TALLY.md)** - Full project analysis

---

## 🎯 Roadmap

### Completed ✅
- ✅ Complete backend API (100+ endpoints)
- ✅ Authentication & Authorization (JWT + RBAC)
- ✅ User & Shop Management
- ✅ Product & Service Management
- ✅ Order Processing
- ✅ Ranking System
- ✅ Admin Dashboard
- ✅ Postman Collection

### In Progress 🚧
- 🚧 Improve test coverage (current: 42%)
- 🚧 API documentation (Swagger/OpenAPI)

### Planned 📋
- 📋 Email notifications (NodeMailer/SendGrid)
- 📋 File upload (Multer + AWS S3/Cloudinary)
- 📋 Payment integration (Stripe/PayPal)
- 📋 Real-time notifications (Socket.io)
- 📋 Advanced search (Elasticsearch)
- 📋 Caching (Redis)
- 📋 Rate limiting (express-rate-limit)
- 📋 GraphQL API (optional)
- 📋 Frontend (React/Next.js)

---

## 📊 Project Status

| Feature | Status | Completion |
|---------|--------|------------|
| Backend API | ✅ Complete | 100% |
| Database Schema | ✅ Complete | 100% |
| Authentication | ✅ Complete | 100% |
| Authorization (RBAC) | ✅ Complete | 100% |
| Admin Dashboard | ✅ Complete | 100% |
| Testing | ⚠️ Partial | 42% |
| Documentation | ✅ Complete | 100% |
| Frontend | ❌ Not Started | 0% |
| Deployment | 📋 Planned | 0% |

**Overall Backend Completion: 100%** 🎉  
**Overall Project Completion: 33%** (Backend only)

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
refactor: Code refactoring
test: Test updates
chore: Maintenance tasks
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- Prisma team for the amazing ORM
- PostgreSQL team for the robust database
- All open-source contributors

---

## 📞 Support

### Need Help?

- 📖 Check [Documentation](#documentation)
- 🐛 Report bugs via Issues
- 💬 Join discussions
- 📧 Contact: support@gsmmarketplace.com

---

**Built with ❤️ by the GSM Team**

⭐ Star this repo if you find it helpful!  
🐛 Found a bug? [Report it](https://github.com/yourusername/project_gsm/issues)  
💡 Have suggestions? [Share them](https://github.com/yourusername/project_gsm/discussions)


---

**Built with:** Node.js, Express.js, Prisma, PostgreSQL, Zod, JWT
