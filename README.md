# GSM Multi-Vendor Marketplace - Backend API

A complete, production-ready backend API for a multi-vendor marketplace with RBAC, shop management, product catalog, blogging, and order processing.

## 🚀 Features

### Core Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control (RBAC)
- **Multi-Vendor System** - Shops with owner, staff, and follower management
- **Product & Service Catalog** - Complete CRUD with inventory management
- **Blog/Content System** - Posts with comments, likes, and content moderation
- **Order Management** - Full order lifecycle with payment tracking
- **Shop Ranking System** - Points-based ranking with strike management
- **Content Moderation** - User warnings, blocking, and soft delete support
- **Activity Logging** - Complete audit trail of admin actions

### Technical Features

- **Separation of Concerns** - Clean architecture with controllers, services, validations
- **Zod Validation** - Schema validation for all API endpoints
- **Soft Deletes** - Prisma middleware for automatic soft delete handling
- **Pagination** - Built-in pagination for all list endpoints
- **Error Handling** - Centralized error handling with detailed messages
- **Database Migrations** - Prisma migration system
- **Database Seeding** - Auto-seed script for roles, permissions, and admin user

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
│   │   └── order.controller.js
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/           # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── shop.routes.js
│   │   ├── product.routes.js
│   │   ├── post.routes.js
│   │   ├── order.routes.js
│   │   └── index.js
│   ├── services/         # Business logic
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── shop.service.js
│   │   ├── product.service.js
│   │   ├── post.service.js
│   │   └── order.service.js
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
├── GSM_Marketplace_Postman_Collection.json
└── README.md
```

## 📊 Database Models

### Core Models (19 total)

- **User** - User accounts with authentication
- **Role** - User roles (admin, shop_owner, customer)
- **Permission** - Granular permissions
- **RolePermission** - Role-permission mapping
- **UserRole** - User-role assignment
- **Shop** - Vendor shops with verification
- **ShopStaff** - Shop team members
- **ShopFollower** - Shop followers
- **RankingPoint** - Shop ranking system
- **ShopStrike** - Violation tracking
- **Product** - Product catalog
- **Service** - Service offerings
- **Post** - Blog/content posts
- **Review** - Product/shop reviews
- **Comment** - Post comments
- **Order** - Customer orders
- **OrderItem** - Order line items
- **UserWarning** - User violations
- **ActivityLog** - Admin action logs

### Enums (13 total)

- ShopCategory, VerificationStatus, ShopStaffRole
- ProductCategory, ServiceCategory, PostType
- PostStatus, CommentStatus, ReviewRating
- OrderStatus, PaymentMethod, PaymentStatus
- WarningSeverity

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/gsm_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
PORT=5000
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (creates admin user and roles)
npm run prisma:seed
```

### 4. Start Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

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

### Products

- `POST /api/products` - Create product
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PUT /api/products/:id/stock` - Update stock

### Posts

- `POST /api/posts` - Create post
- `GET /api/posts` - Get all posts (public)
- `GET /api/posts/:id` - Get post details
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comments` - Add comment
- `PUT /api/posts/:id/disable` - Disable post (admin)

### Orders

- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/payment` - Update payment (admin)
- `PUT /api/orders/:id/cancel` - Cancel order

## 🧪 Testing with Postman

1. Import the collection:

   - Open Postman
   - Click Import
   - Select `GSM_Marketplace_Postman_Collection.json`

2. Test workflow:
   - Run "Login" request with admin credentials
   - Token auto-saves to collection variables
   - All authenticated requests will use the token automatically

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

## 🏗️ Architecture Patterns

### Separation of Concerns

- **Controllers** - Handle HTTP requests/responses
- **Services** - Contain business logic
- **Validations** - Zod schemas for input validation
- **Middleware** - Cross-cutting concerns (auth, error handling)
- **Utils** - Reusable helper functions

### Validation Flow

```
Request → Validation Middleware → Controller → Service → Database
```

### Authentication Flow

```
Login → Generate JWT → Store Token → Include in Authorization Header
```

### Soft Delete Implementation

All delete operations use Prisma middleware to automatically:

- Convert `delete` to `update` with `deletedAt` timestamp
- Filter out deleted records in all queries
- Maintain data integrity and audit trail

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - Granular permissions
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Prisma parameterized queries
- **Soft Deletes** - Data retention for audit
- **CORS Configuration** - Configurable origins

## 📝 Environment Variables

| Variable             | Description                  | Default        |
| -------------------- | ---------------------------- | -------------- |
| `PORT`               | Server port                  | 5000           |
| `NODE_ENV`           | Environment                  | development    |
| `DATABASE_URL`       | PostgreSQL connection string | -              |
| `JWT_SECRET`         | JWT signing key              | -              |
| `JWT_REFRESH_SECRET` | Refresh token key            | -              |
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

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure CORS properly
4. Use environment variables for sensitive data
5. Enable HTTPS
6. Set up proper PostgreSQL backup
7. Configure logging (Winston/Morgan)
8. Set up monitoring (PM2/New Relic)

## 📄 License

MIT License

## 👨‍💻 Development

For questions or issues, please contact the development team.

---

**Built with:** Node.js, Express.js, Prisma, PostgreSQL, Zod, JWT
