# 🚀 GSM Marketplace - Quick Start Guide

**Get your backend running in 5 minutes!**

---

## ⚡ Fast Setup (Copy-Paste Ready)

### 1️⃣ Install Dependencies

```bash
cd backend
npm install
```

### 2️⃣ Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/gsm_marketplace"
JWT_SECRET="your-super-secret-jwt-key-at-least-64-characters-long-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-key-at-least-64-characters-long-change-this"
```

### 3️⃣ Setup Database

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

### 4️⃣ Start Server

```bash
npm run dev
```

✅ **Server running at:** `http://localhost:5000`

---

## 🧪 Test the API (Postman)

### Option 1: Quick Test (Postman)

1. Open Postman
2. Click **Import** → Select `postman_collection.json`
3. Run **Register User** (token saves automatically)
4. Explore 100+ endpoints! 🎉

### Option 2: cURL Test

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

---

## 📚 Default Admin Account

After seeding:

```
Email: admin@gsm.com
Password: Admin123!
```

Use this to test admin endpoints!

---

## 🎯 What's Available?

### ✅ 100+ API Endpoints Across:

- 🔐 **Authentication** - Register, Login, Refresh Token
- 👥 **Users** - CRUD, Block, Warn, Verify
- 🏪 **Shops** - Create, Verify, Staff, Rankings
- 📦 **Products** - CRUD, Stock, Reviews
- 🛠️ **Services** - CRUD, Reviews
- 📝 **Posts** - Blog, Comments, Likes
- 🛒 **Orders** - Create, Track, Cancel
- 💬 **Comments** - Nested Replies
- 🎭 **Roles & Permissions** - RBAC System
- 📊 **Admin Dashboard** - Stats, Moderation

---

## 📖 Next Steps

### 📄 Read the Guides

1. **[README.md](./README.md)** - Full documentation
2. **[POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)** - API testing guide
3. **[BACKEND_COMPLETION_SUMMARY.md](./BACKEND_COMPLETION_SUMMARY.md)** - Feature details

### 🔧 Explore the Code

```
src/
├── controllers/    # Request handlers (11 files)
├── services/       # Business logic (11 files)
├── routes/         # API routes (11 files)
├── middlewares/    # Auth, Error handling
└── utils/          # AppError, asyncHandler
```

### 🧪 Test Everything

Import `postman_collection.json` and test:
- User registration & login
- Shop creation & verification
- Product management
- Order processing
- Admin dashboard
- Role & permission management

---

## 🐛 Troubleshooting

### Database Connection Error?

```bash
# Check PostgreSQL is running
psql --version

# Verify DATABASE_URL in .env
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

### Prisma Client Error?

```bash
npx prisma generate
```

### Port Already in Use?

Change `PORT` in `.env` to something else (e.g., 5001)

### Seed Script Fails?

```bash
# Reset database
npx prisma migrate reset

# Try seeding again
npm run seed
```

---

## 💡 Pro Tips

### 🔥 Hot Tips

1. **Auto Token Management** - Postman collection extracts and saves tokens automatically
2. **Soft Delete** - All deletes are soft (data preserved with `deletedAt`)
3. **RBAC System** - Create custom roles with specific permissions
4. **Ranking System** - Shops auto-rank based on verification, sales, reviews
5. **Admin Dashboard** - `/api/admin/dashboard` gives comprehensive stats

### 🎨 Customization

- **Change JWT Expiry** - Edit `JWT_EXPIRES_IN` in `.env`
- **Add New Roles** - Use `/api/roles` endpoints
- **Custom Permissions** - Use `/api/permissions` endpoints
- **Modify Ranking** - Check `src/services/ranking.service.js`

---

## 📊 Quick Stats

| Metric | Count |
|--------|-------|
| API Endpoints | 100+ |
| Database Tables | 19 |
| Controllers | 11 |
| Services | 11 |
| Routes | 11 |
| Lines of Code | ~8,000+ |

---

## 🚀 Ready to Build?

You now have:
- ✅ Complete backend with 100+ endpoints
- ✅ PostgreSQL database with 19 tables
- ✅ JWT authentication with RBAC
- ✅ Admin dashboard
- ✅ Postman collection for testing
- ✅ Comprehensive documentation

**Start building your frontend or integrate with existing apps!**

---

## 🆘 Need Help?

- 📖 **Full Docs:** [README.md](./README.md)
- 🧪 **Testing Guide:** [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)
- 🎯 **Features:** [BACKEND_COMPLETION_SUMMARY.md](./BACKEND_COMPLETION_SUMMARY.md)
- 🐛 **Issues:** Create a GitHub issue
- 💬 **Questions:** Check documentation first

---

**Built with ❤️ - Happy Coding! 🎉**
