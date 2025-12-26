# Testing Checklist - Error Handling Verification

## Quick Test Commands

### Run All Tests

```bash
npm test
```

### Run Individual Test Suites

```bash
npm test -- tests/auth.test.js
npm test -- tests/user.test.js
npm test -- tests/shop.test.js
npm test -- tests/product.test.js
npm test -- tests/post.test.js
npm test -- tests/order.test.js
```

## Expected Improvements

### Auth Tests (Priority: HIGH)

**Before: 6/11 passing**
**Expected: 10-11/11 passing**

Critical fixes:

- ✅ Duplicate email → 400 (was 500)
- ✅ Incorrect password → 401 (was 500)
- ✅ Non-existent email → 401 (was 500)
- ✅ Change password success → 200 (was 500)
- ✅ Wrong current password → 401 (was 500)

### User Tests

**Before: 4/10 passing**
**Expected: 6-7/10 passing**

Fixes:

- ✅ User not found → 404 (was 500)

### Shop Tests

**Before: 7/14 passing**
**Expected: 10-12/14 passing**

Fixes:

- ✅ Shop not found → 404 (was 500)
- ✅ Unauthorized updates → 403 (was 500)
- ✅ Staff management auth → 403 (was 500)
- ✅ Already following → 400 (was 500)

### Product Tests

**Before: 3/8 passing**
**Expected: 5-7/8 passing**

Fixes:

- ✅ Product not found → 404 (was 500)
- ✅ Shop not found → 404 (was 500)
- ✅ Unauthorized actions → 403 (was 500)

### Post Tests

**Before: 3/10 passing**
**Expected: 6-8/10 passing**

Fixes:

- ✅ Post not found → 404 (was 500)
- ✅ Shop not found → 404 (was 500)
- ✅ Unauthorized actions → 403 (was 500)

### Order Tests

**Before: 2/6 passing**
**Expected: 4-5/6 passing**

Fixes:

- ✅ Order not found → 404 (was 500)
- ✅ Product not found → 404 (was 500)
- ✅ Insufficient stock → 400 (was 500)
- ✅ Unauthorized actions → 403 (was 500)
- ✅ Invalid cancellation → 400 (was 500)

## Manual Testing Checklist

### 1. Authentication Errors

- [ ] Register with duplicate email returns 400
- [ ] Login with wrong password returns 401
- [ ] Login with non-existent email returns 401
- [ ] Change password with wrong current password returns 401

### 2. Authorization Errors

- [ ] Non-owner trying to update shop returns 403
- [ ] Non-owner trying to delete product returns 403
- [ ] Non-author trying to update post returns 403
- [ ] Non-owner trying to cancel order returns 403

### 3. Not Found Errors

- [ ] Get non-existent user returns 404
- [ ] Get non-existent shop returns 404
- [ ] Get non-existent product returns 404
- [ ] Get non-existent post returns 404
- [ ] Get non-existent order returns 404

### 4. Validation Errors

- [ ] Already following shop returns 400
- [ ] Insufficient stock returns 400
- [ ] Cancel non-pending order returns 400

## Status Code Verification

Use this script to verify status codes:

```bash
# Auth - Duplicate email (should be 400)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"Test123!","firstName":"Test","lastName":"User"}' \
  -w "\nStatus: %{http_code}\n"

# Auth - Wrong password (should be 401)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrongpassword"}' \
  -w "\nStatus: %{http_code}\n"

# Shop - Not found (should be 404)
curl -X GET http://localhost:5000/api/shops/nonexistent-id \
  -w "\nStatus: %{http_code}\n"
```

## Success Criteria

### Minimum Goals

- [ ] All auth tests passing (11/11)
- [ ] At least 40/59 tests passing (68%)
- [ ] No 500 errors for validation/auth/not-found cases

### Stretch Goals

- [ ] 50/59 tests passing (85%)
- [ ] All error responses have correct status codes
- [ ] All test suites have >70% pass rate

## Debugging Failed Tests

If tests still fail after error handling fix:

### 1. Check Error Messages

```javascript
// Ensure error messages match test expectations
expect(response.body.message).toBe("Invalid credentials");
```

### 2. Check Status Codes

```javascript
// Verify status code is correct
expect(response.status).toBe(401);
```

### 3. Check Error Response Format

```javascript
// Ensure response structure matches
{
  success: false,
  message: "Error message"
}
```

### 4. Common Issues

- Field name mismatches (e.g., passwordHash vs password)
- Missing relationships in Prisma queries
- Cookie vs Authorization header authentication
- Permission checks (requireRole vs manual checks)

## Next Steps After Testing

1. **If tests pass**:

   - Document remaining failures
   - Categorize by issue type
   - Prioritize fixes

2. **If tests still fail**:
   - Analyze error logs
   - Check field name consistency
   - Verify Prisma schema matches code
   - Review authentication flow

## Progress Tracking

| Test Suite | Before    | After    | Improvement |
| ---------- | --------- | -------- | ----------- |
| Auth       | 6/11      | ?/11     | ?           |
| User       | 4/10      | ?/10     | ?           |
| Shop       | 7/14      | ?/14     | ?           |
| Product    | 3/8       | ?/8      | ?           |
| Post       | 3/10      | ?/10     | ?           |
| Order      | 2/6       | ?/6      | ?           |
| **Total**  | **25/59** | **?/59** | **?**       |
