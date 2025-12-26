# Error Handling Quick Reference

## ✅ What Was Fixed

All services now use **custom AppError class** instead of plain Error objects, ensuring correct HTTP status codes.

## 🔧 How to Use AppError

### Import

```javascript
import { AppError } from "../utils/error.util.js";
```

### Usage

```javascript
// ❌ BEFORE (always returned 500)
throw new Error("User not found");

// ✅ AFTER (returns correct status code)
throw new AppError("User not found", 404);
```

## 📋 Status Code Guide

### 400 - Bad Request

Use for: **Client-side validation errors, business rule violations**

Examples:

```javascript
throw new AppError("Email or username already exists", 400);
throw new AppError("Insufficient stock for ${product.name}", 400);
throw new AppError("Already following this shop", 400);
throw new AppError("Can only cancel pending orders", 400);
```

### 401 - Unauthorized

Use for: **Authentication failures, invalid credentials**

Examples:

```javascript
throw new AppError("Invalid credentials", 401);
throw new AppError("Current password is incorrect", 401);
throw new AppError("Invalid or expired token", 401);
```

### 403 - Forbidden

Use for: **Authorization failures, insufficient permissions**

Examples:

```javascript
throw new AppError("Account is inactive", 403);
throw new AppError("Account is blocked: ${reason}", 403);
throw new AppError("Not authorized to update this shop", 403);
throw new AppError("Not authorized to delete this product", 403);
```

### 404 - Not Found

Use for: **Missing resources**

Examples:

```javascript
throw new AppError("User not found", 404);
throw new AppError("Shop not found", 404);
throw new AppError("Product not found", 404);
throw new AppError("Post not found", 404);
throw new AppError("Order not found", 404);
```

### 500 - Internal Server Error

Use for: **Unexpected errors (default)**

```javascript
// AppError defaults to 500 if no status code provided
throw new AppError("An unexpected error occurred");
```

## 🎯 Common Patterns

### Resource Not Found

```javascript
const user = await prisma.user.findUnique({ where: { id } });
if (!user) {
  throw new AppError("User not found", 404);
}
```

### Authorization Check

```javascript
if (shop.ownerId !== userId) {
  throw new AppError("Not authorized to update this shop", 403);
}
```

### Validation Error

```javascript
if (product.quantity < requestedQuantity) {
  throw new AppError(`Insufficient stock for ${product.name}`, 400);
}
```

### Duplicate Entry

```javascript
if (existingUser) {
  throw new AppError("Email or username already exists", 400);
}
```

### Invalid Credentials

```javascript
const isValid = await bcrypt.compare(password, user.passwordHash);
if (!isValid) {
  throw new AppError("Invalid credentials", 401);
}
```

## 📊 Updated Services

All 6 services now use AppError:

- ✅ `src/services/auth.service.js` (6 errors)
- ✅ `src/services/user.service.js` (1 error)
- ✅ `src/services/shop.service.js` (6 errors)
- ✅ `src/services/product.service.js` (5 errors)
- ✅ `src/services/post.service.js` (5 errors)
- ✅ `src/services/order.service.js` (7 errors)

**Total**: 30+ error throws updated

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Suite

```bash
npm test -- tests/auth.test.js
```

### Expected Results

- Auth: 10-11/11 passing (was 6/11)
- Total: 35-45/59 passing (was 25/59)
- All errors return correct status codes

## 📚 Documentation

- **ERROR_HANDLING_FIX.md** - Detailed technical explanation
- **TESTING_CHECKLIST.md** - Comprehensive testing guide
- **COMMIT_SUMMARY.md** - Complete refactor summary
- **QUICK_REFERENCE.md** - This document

## 🚨 Important Notes

1. **Always import AppError** when adding new error handling
2. **Use specific status codes** - avoid defaulting to 500
3. **Keep error messages descriptive** for better debugging
4. **Match test expectations** - error messages should match test assertions

## 💡 Decision Tree

When throwing an error, ask:

1. **Is the resource missing?** → 404
2. **Is it an auth failure?** → 401
3. **Is it a permission issue?** → 403
4. **Is it a validation error?** → 400
5. **Is it unexpected?** → 500 (default)

## ✨ Benefits

- ✅ Proper HTTP semantics
- ✅ Better error messages
- ✅ Easier debugging
- ✅ Clearer test failures
- ✅ Consistent error handling
- ✅ RESTful API compliance
