# 🚀 Postman Collection - Quick Start Guide

## 📦 What's Included

This Postman collection contains **100+ API endpoints** for the GSM Marketplace platform, organized into 11 categories:

1. **Authentication** (6 endpoints)
2. **Users** (9 endpoints)
3. **Shops** (15 endpoints)
4. **Products** (6 endpoints)
5. **Posts** (9 endpoints)
6. **Orders** (5 endpoints)
7. **Services** (5 endpoints)
8. **Comments** (6 endpoints)
9. **Roles** (7 endpoints)
10. **Permissions** (6 endpoints)
11. **Admin Dashboard** (6 endpoints)

---

## 📥 How to Import

### Option 1: Import from File
1. Open Postman
2. Click **"Import"** button (top left)
3. Click **"Upload Files"**
4. Select `postman_collection.json` from the backend folder
5. Click **"Import"**

### Option 2: Drag and Drop
1. Open Postman
2. Drag `postman_collection.json` file into Postman window
3. Collection will be automatically imported

---

## ⚙️ Collection Setup

### Variables
The collection uses these variables (automatically managed):

| Variable | Description | Auto-Saved |
|----------|-------------|------------|
| `baseUrl` | API base URL (http://localhost:5000/api) | Manual |
| `accessToken` | JWT access token | ✅ Auto |
| `refreshToken` | JWT refresh token | ✅ Auto |
| `userId` | Current user ID | ✅ Auto |
| `shopId` | Created shop ID | ✅ Auto |
| `productId` | Created product ID | ✅ Auto |
| `postId` | Created post ID | ✅ Auto |
| `orderId` | Created order ID | ✅ Auto |
| `serviceId` | Created service ID | ✅ Auto |
| `commentId` | Created comment ID | ✅ Auto |
| `roleId` | Created role ID | ✅ Auto |
| `permissionId` | Created permission ID | ✅ Auto |

### Authentication
- Collection is pre-configured with **Bearer Token** authentication
- Token is automatically applied to all requests (except Login/Register)
- Access token is auto-saved after successful login/register

---

## 🎯 Quick Start (5 Steps)

### 1. Start the Server
```bash
cd backend
npm run dev
```

### 2. Register a User
- Open **"1. Authentication"** folder
- Run **"Register User"** request
- ✅ Access token will be automatically saved

### 3. Test Other Endpoints
All endpoints are now ready to use! The access token is automatically included.

**Try these in order:**
1. **Create Shop** (`POST /api/shops`)
2. **Create Product** (`POST /api/products`)
3. **Create Post** (`POST /api/posts`)
4. **Create Order** (`POST /api/orders`)

### 4. Admin Endpoints
For admin endpoints, you'll need to:
1. Update user role in database to "admin"
2. Or use the admin account credentials

### 5. Explore All Categories
Browse through all 11 categories and test the endpoints!

---

## 📋 Testing Workflow Example

### Complete Flow: From User to Order

```
1. Register User
   └─> Saves: accessToken, userId

2. Get Current User
   └─> Verify registration

3. Create Shop
   └─> Saves: shopId

4. Create Product
   └─> Saves: productId
   └─> Use shopId from step 3

5. Create Post
   └─> Saves: postId
   └─> Use shopId from step 3

6. Create Order
   └─> Saves: orderId
   └─> Use shopId and productId

7. Get Order By ID
   └─> View order details

8. Update Order Status
   └─> Change to "shipped"
```

---

## 🔑 Authentication Flow

### First Time Setup
1. **Register User** - Creates account + returns tokens
2. **Login** - Returns new tokens (if needed)
3. **Refresh Token** - Get new access token when expired

### Token Management
- **Access Token**: Valid for ~7 days (stored in `accessToken` variable)
- **Refresh Token**: Valid for ~30 days (stored in `refreshToken` variable)
- Use **Refresh Token** endpoint when access token expires

---

## 📚 Endpoint Categories

### 1. Authentication
Start here! Register and login to get your access token.

### 2. Users
Manage user accounts, verify users, block/unblock, warnings.

### 3. Shops
Create and manage shops, verification workflow, staff management.

### 4. Products
Product CRUD, stock management, reviews.

### 5. Posts
Create blog posts, announcements, services. Like and comment.

### 6. Orders
Create orders, track status, cancel orders.

### 7. Services
Manage services offered by shops, add reviews.

### 8. Comments
Add comments to posts/products, nested replies, moderation.

### 9. Roles
Create and manage user roles (admin only).

### 10. Permissions
Manage permissions and resource access (admin only).

### 11. Admin Dashboard
Admin statistics, user management, shop verification, activity logs.

---

## 💡 Tips & Tricks

### Query Parameters
Many GET endpoints support filters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term
- `isActive` - Filter by active status
- `category` - Filter by category
- etc.

**Example:**
```
GET /api/products?page=1&limit=10&search=laptop&minPrice=500&maxPrice=2000
```

### Request Bodies
All POST/PUT requests include example JSON bodies:
```json
{
  "name": "Example Product",
  "price": 99.99,
  "stock": 100
}
```

### Test Scripts
Many requests include test scripts that:
- Auto-save response IDs to variables
- Auto-save access tokens
- Validate responses

### Collection Runner
Run entire folders sequentially:
1. Select a folder (e.g., "1. Authentication")
2. Click "Run" button
3. All requests run in order

---

## 🐛 Troubleshooting

### 401 Unauthorized
- Token expired → Use **Refresh Token** endpoint
- Not logged in → Use **Login** endpoint first

### 403 Forbidden
- Insufficient permissions
- For admin endpoints, ensure user has admin role

### 404 Not Found
- Resource doesn't exist
- Check if ID variables are set correctly
- Verify endpoint URL is correct

### 500 Internal Server Error
- Server error - check server logs
- Database connection issue
- Validation error in request body

---

## 📖 Endpoint Details

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/profile` | Get current user |
| PUT | `/auth/profile` | Update profile |
| POST | `/auth/change-password` | Change password |
| POST | `/auth/refresh` | Refresh access token |

### Shop Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/shops` | Create shop |
| GET | `/shops` | List all shops |
| GET | `/shops/:id` | Get shop by ID |
| PUT | `/shops/:id` | Update shop |
| DELETE | `/shops/:id` | Delete shop |
| PUT | `/shops/:id/verify` | Verify shop (Admin) |
| PUT | `/shops/:id/block` | Block shop (Admin) |
| PUT | `/shops/:id/unblock` | Unblock shop (Admin) |
| POST | `/shops/:id/strike` | Issue strike (Admin) |
| POST | `/shops/:id/staff` | Add staff |
| DELETE | `/shops/:shopId/staff/:staffId` | Remove staff |
| POST | `/shops/:id/follow` | Follow shop |
| DELETE | `/shops/:id/follow` | Unfollow shop |
| GET | `/shops/:shopId/services` | Get shop services |
| POST | `/shops/:shopId/services` | Create service |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Get dashboard stats |
| GET | `/admin/users` | Get all users (filtered) |
| GET | `/admin/shops/pending` | Pending verifications |
| GET | `/admin/activity-logs` | Activity logs |
| POST | `/admin/moderate` | Moderate content |
| GET | `/admin/reports` | Get reports |

*See full endpoint list in collection!*

---

## 🎓 Best Practices

1. **Start with Authentication** - Always register/login first
2. **Use Variables** - IDs are auto-saved, use them in subsequent requests
3. **Check Responses** - Review response data to understand the API
4. **Organize Requests** - Use folders to group related tests
5. **Save Examples** - Save successful responses as examples
6. **Environment Setup** - Consider creating separate environments (dev, staging, prod)

---

## 📞 Need Help?

- Check server logs for detailed error messages
- Verify all required fields in request body
- Ensure server is running (`npm run dev`)
- Check database connection
- Review [BACKEND_COMPLETION_SUMMARY.md](./BACKEND_COMPLETION_SUMMARY.md) for more details

---

## ✅ Checklist

- [ ] Postman collection imported
- [ ] Server running (`npm run dev`)
- [ ] User registered (access token saved)
- [ ] Shop created (shopId saved)
- [ ] Product created (productId saved)
- [ ] Order created and tested
- [ ] All endpoint categories explored

---

**Happy Testing! 🚀**

For complete API documentation and backend details, see:
- [BACKEND_COMPLETION_SUMMARY.md](./BACKEND_COMPLETION_SUMMARY.md)
- [PROJECT_COMPLETION_TALLY.md](./PROJECT_COMPLETION_TALLY.md)
