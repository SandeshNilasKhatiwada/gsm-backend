# Error Handling Fix Summary

## Issue

All services were throwing plain `Error` objects without HTTP status codes, causing the error middleware to default all errors to **500 Internal Server Error**, even when they should be 400, 401, 403, or 404.

## Root Cause

```javascript
// ❌ BEFORE - No status code
throw new Error("Invalid credentials");

// Error middleware checks err.statusCode
res.status(err.statusCode || 500); // Always returned 500
```

## Solution

Created custom `AppError` class with status code support:

### 1. Created AppError Utility (`src/utils/error.util.js`)

```javascript
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### 2. Updated All Services

Replaced all `throw new Error()` with `throw new AppError(message, statusCode)`:

#### auth.service.js

- ✅ "Email or username already exists" → **400**
- ✅ "Invalid credentials" → **401**
- ✅ "Account is inactive" → **403**
- ✅ "Account is blocked" → **403**
- ✅ "Current password is incorrect" → **401**
- ✅ "User not found" → **404**

#### user.service.js

- ✅ "User not found" → **404**

#### shop.service.js

- ✅ "Shop not found" → **404**
- ✅ "Not authorized to update this shop" → **403**
- ✅ "Not authorized to add staff" → **403**
- ✅ "Not authorized to remove staff" → **403**
- ✅ "Already following this shop" → **400**
- ✅ "Not authorized to delete this shop" → **403**

#### product.service.js

- ✅ "Shop not found" → **404**
- ✅ "Not authorized to add products to this shop" → **403**
- ✅ "Product not found" → **404**
- ✅ "Not authorized to update this product" → **403**
- ✅ "Not authorized to delete this product" → **403**

#### post.service.js

- ✅ "Shop not found" → **404**
- ✅ "Not authorized to create posts for this shop" → **403**
- ✅ "Post not found" → **404**
- ✅ "Not authorized to update this post" → **403**
- ✅ "Not authorized to delete this post" → **403**

#### order.service.js

- ✅ "Product {id} not found" → **404**
- ✅ "Insufficient stock for {name}" → **400**
- ✅ "Order not found" → **404**
- ✅ "Not authorized to update this order" → **403**
- ✅ "Not authorized to view this order" → **403**
- ✅ "Not authorized to cancel this order" → **403**
- ✅ "Can only cancel pending orders" → **400**

## Status Code Guidelines

| Code    | Type         | Use Cases                                                   |
| ------- | ------------ | ----------------------------------------------------------- |
| **400** | Bad Request  | Duplicate data, validation errors, business rule violations |
| **401** | Unauthorized | Invalid credentials, wrong password                         |
| **403** | Forbidden    | No permission to access resource, account blocked/inactive  |
| **404** | Not Found    | Resource doesn't exist                                      |
| **500** | Server Error | Unexpected errors (default)                                 |

## Expected Impact

This fix should resolve multiple test failures:

### Auth Tests (5/11 → 10-11/11)

- ❌ "should fail with duplicate email" (expected 400, got 500) → ✅
- ❌ "should fail with incorrect password" (expected 401, got 500) → ✅
- ❌ "should fail with non-existent email" (expected 401, got 500) → ✅
- ❌ "should change password successfully" (expected 200, got 500) → ✅
- ❌ "should fail with wrong current password" (expected 401, got 500) → ✅

### Other Test Suites

Similar improvements expected across:

- User tests (4/10 → 6-7/10)
- Shop tests (7/14 → 10-12/14)
- Product tests (3/8 → 5-7/8)
- Post tests (3/10 → 6-8/10)
- Order tests (2/6 → 4-5/6)

### Overall Progress

- Before: **25/59 tests passing (42%)**
- Expected After: **35-45/59 tests passing (60-75%)**

## Verification

Run tests to confirm fixes:

```bash
npm test
```

Check specific test suite:

```bash
npm test -- tests/auth.test.js
```

## Error Middleware

The error middleware (`src/middlewares/error.middleware.js`) now correctly handles:

1. Custom AppError with statusCode
2. Prisma errors (P2002, P2025)
3. Generic errors (defaults to 500)

```javascript
res.status(err.statusCode || 500).json({
  success: false,
  message: err.message || "Internal server error",
  ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
});
```

## Files Modified

1. ✅ `src/utils/error.util.js` (created)
2. ✅ `src/services/auth.service.js`
3. ✅ `src/services/user.service.js`
4. ✅ `src/services/shop.service.js`
5. ✅ `src/services/product.service.js`
6. ✅ `src/services/post.service.js`
7. ✅ `src/services/order.service.js`

## Commit

```
Fix error handling: Replace plain Error with AppError for proper HTTP status codes

- Created AppError utility class with statusCode support
- Updated all services to use AppError
- Proper status codes: 400, 401, 403, 404
- Error middleware now correctly handles statusCode property
- This fixes multiple test failures where 500 errors should be 400/401/403/404
```
