# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### Register User

```http
POST /auth/register
```

**Body:**

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "fullName": "John Doe",
  "phoneNumber": "9876543210",
  "address": "Kathmandu, Nepal"
}
```

### Login

```http
POST /auth/login
```

**Body:**

```json
{
  "email": "admin@gsm.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  }
}
```

### Get Profile

```http
GET /auth/profile
Authorization: Bearer <token>
```

### Update Profile

```http
PUT /auth/profile
Authorization: Bearer <token>
```

**Body:**

```json
{
  "fullName": "Updated Name",
  "phoneNumber": "1234567890",
  "bio": "My bio",
  "profileImage": "https://example.com/image.jpg"
}
```

### Change Password

```http
PUT /auth/change-password
Authorization: Bearer <token>
```

**Body:**

```json
{
  "oldPassword": "currentpassword",
  "newPassword": "newpassword123"
}
```

---

## 2. User Management (Admin Only)

### Get All Users

```http
GET /users?page=1&limit=10&search=john&role=customer&isVerified=true
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by email, username, or full name
- `role` (optional): Filter by role
- `isVerified` (optional): Filter by verification status
- `isActive` (optional): Filter by active status
- `isBlocked` (optional): Filter by blocked status

### Get User By ID

```http
GET /users/:id
Authorization: Bearer <token>
```

### Block User

```http
PUT /users/:id/block
Authorization: Bearer <token>
```

**Body:**

```json
{
  "reason": "Violation of terms and conditions"
}
```

### Warn User

```http
POST /users/:id/warn
Authorization: Bearer <token>
```

**Body:**

```json
{
  "reason": "Inappropriate content",
  "severity": "medium"
}
```

**Severity values:** `low`, `medium`, `high`, `critical`

---

## 3. Shop Endpoints

### Create Shop

```http
POST /shops
Authorization: Bearer <token>
```

**Body:**

```json
{
  "name": "My Awesome Shop",
  "description": "We sell amazing products",
  "category": "electronics",
  "address": "Kathmandu, Nepal",
  "phoneNumber": "9876543210",
  "email": "shop@example.com",
  "website": "https://myshop.com",
  "logo": "https://example.com/logo.jpg",
  "banner": "https://example.com/banner.jpg"
}
```

**Category values:** `electronics`, `fashion`, `food`, `beauty`, `home`, `sports`, `books`, `toys`, `automotive`, `health`, `other`

### Get All Shops

```http
GET /shops?page=1&limit=10&search=electronics&category=electronics&isVerified=true&sortBy=rating
```

**Query Parameters:**

- `page`, `limit`: Pagination
- `search`: Search shops
- `category`: Filter by category
- `isVerified`: Filter verified shops
- `isBlocked`: Filter blocked shops
- `sortBy`: Sort by `rating`, `followers`, or `createdAt`

### Get Shop By ID

```http
GET /shops/:id
```

### Update Shop

```http
PUT /shops/:id
Authorization: Bearer <token>
```

### Follow Shop

```http
POST /shops/:id/follow
Authorization: Bearer <token>
```

### Unfollow Shop

```http
DELETE /shops/:id/follow
Authorization: Bearer <token>
```

### Verify Shop (Admin)

```http
PUT /shops/:id/verify
Authorization: Bearer <token>
```

### Block Shop (Admin)

```http
PUT /shops/:id/block
Authorization: Bearer <token>
```

**Body:**

```json
{
  "reason": "Fraudulent activities"
}
```

### Issue Strike (Admin)

```http
POST /shops/:id/strike
Authorization: Bearer <token>
```

**Body:**

```json
{
  "reason": "Selling prohibited items",
  "severity": "high",
  "expiresInDays": 30
}
```

---

## 4. Product Endpoints

### Create Product

```http
POST /products
Authorization: Bearer <token>
```

**Body:**

```json
{
  "shopId": "shop-uuid",
  "name": "Awesome Product",
  "description": "Product description",
  "price": 999.99,
  "compareAtPrice": 1299.99,
  "quantity": 100,
  "sku": "PROD-001",
  "category": "electronics",
  "images": ["https://example.com/image1.jpg"],
  "tags": ["gadget", "tech"],
  "isActive": true
}
```

### Get All Products

```http
GET /products?page=1&limit=10&search=phone&category=electronics&shopId=uuid&minPrice=100&maxPrice=1000&sortBy=price-asc
```

**Query Parameters:**

- `search`: Search products
- `category`: Filter by category
- `shopId`: Filter by shop
- `minPrice`, `maxPrice`: Price range
- `sortBy`: `price-asc`, `price-desc`, `rating`, `createdAt`

### Get Product By ID

```http
GET /products/:id
```

### Update Product

```http
PUT /products/:id
Authorization: Bearer <token>
```

### Delete Product

```http
DELETE /products/:id
Authorization: Bearer <token>
```

### Update Stock

```http
PUT /products/:id/stock
Authorization: Bearer <token>
```

**Body:**

```json
{
  "quantity": 50
}
```

---

## 5. Post/Blog Endpoints

### Create Post

```http
POST /posts
Authorization: Bearer <token>
```

**Body:**

```json
{
  "title": "My Blog Post",
  "content": "Full content of the post",
  "excerpt": "Short summary",
  "featuredImage": "https://example.com/image.jpg",
  "postType": "blog",
  "shopId": "shop-uuid",
  "tags": ["tech", "gadgets"],
  "status": "published"
}
```

**Post Types:** `blog`, `news`, `announcement`, `review`, `tutorial`
**Status:** `draft`, `published`, `archived`

### Get All Posts

```http
GET /posts?page=1&limit=10&search=tech&postType=blog&shopId=uuid&authorId=uuid&status=published&sortBy=views
```

### Get Post By ID

```http
GET /posts/:id
```

### Update Post

```http
PUT /posts/:id
Authorization: Bearer <token>
```

### Delete Post

```http
DELETE /posts/:id
Authorization: Bearer <token>
```

### Like Post

```http
POST /posts/:id/like
Authorization: Bearer <token>
```

### Add Comment

```http
POST /posts/:id/comments
Authorization: Bearer <token>
```

**Body:**

```json
{
  "content": "Great post!",
  "parentId": "parent-comment-uuid"
}
```

### Disable Post (Admin)

```http
PUT /posts/:id/disable
Authorization: Bearer <token>
```

**Body:**

```json
{
  "reason": "Inappropriate content"
}
```

---

## 6. Order Endpoints

### Create Order

```http
POST /orders
Authorization: Bearer <token>
```

**Body:**

```json
{
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Kathmandu",
    "state": "Bagmati",
    "postalCode": "44600",
    "country": "Nepal"
  },
  "paymentMethod": "cash_on_delivery",
  "notes": "Please deliver in the morning"
}
```

**Payment Methods:** `cash_on_delivery`, `esewa`, `khalti`, `bank_transfer`, `credit_card`

### Get All Orders

```http
GET /orders?page=1&limit=10&status=pending&paymentStatus=pending
Authorization: Bearer <token>
```

**Order Status:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`
**Payment Status:** `pending`, `paid`, `failed`, `refunded`

### Get Order By ID

```http
GET /orders/:id
Authorization: Bearer <token>
```

### Update Order Status

```http
PUT /orders/:id/status
Authorization: Bearer <token>
```

**Body:**

```json
{
  "status": "processing"
}
```

### Update Payment Status (Admin)

```http
PUT /orders/:id/payment
Authorization: Bearer <token>
```

**Body:**

```json
{
  "paymentStatus": "paid",
  "transactionId": "TXN123456"
}
```

### Cancel Order

```http
PUT /orders/:id/cancel
Authorization: Bearer <token>
```

---

## Error Responses

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Authentication Error

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Authorization Error

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Not Found Error

```json
{
  "success": false,
  "message": "Resource not found"
}
```

---

## Success Response Format

### Single Resource

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Paginated List

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

## Rate Limiting

Currently no rate limiting is implemented. Consider adding in production:

- 100 requests per 15 minutes for authenticated users
- 20 requests per 15 minutes for unauthenticated users

## CORS

Configure allowed origins in `.env`:

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

---

For complete examples, import the **Postman Collection** included in the project.
