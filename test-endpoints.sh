#!/bin/bash

BASE_URL="http://localhost:5000/api"
TOKEN=""
USER_ID=""
SHOP_ID=""
PRODUCT_ID=""
POST_ID=""
ROLE_ID=""
PERMISSION_ID=""
SERVICE_ID=""
COMMENT_ID=""
ORDER_ID=""

echo "===== Testing GSM Marketplace API ====="
echo ""

# Test 1: Register User
echo "1. Register User..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "username": "testuser",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }')
echo "$REGISTER_RESPONSE" | head -c 100
echo ""

# Test 2: Login
echo "2. Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!"
  }')
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | sed 's/"accessToken":"\([^"]*\)"/\1/')
USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"id":"[^"]*"' | sed 's/"id":"\([^"]*\)"/\1/' | head -1)
echo "Token obtained: ${TOKEN:0:20}..."
echo "User ID: $USER_ID"
echo ""

# Test 3: Get Current User
echo "3. Get Current User..."
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | head -c 100
echo ""

# Test 4: Get All Users
echo "4. Get All Users..."
curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN" | head -c 100
echo ""

# Test 5: Create Shop
echo "5. Create Shop..."
SHOP_RESPONSE=$(curl -s -X POST "$BASE_URL/shops" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Shop",
    "description": "A test shop",
    "email": "shop@test.com",
    "phone": "1234567890"
  }')
SHOP_ID=$(echo "$SHOP_RESPONSE" | grep -o '"id":"[^"]*"' | sed 's/"id":"\([^"]*\)"/\1/' | head -1)
echo "Shop ID: $SHOP_ID"
echo ""

# Test 6: Get All Shops
echo "6. Get All Shops..."
curl -s -X GET "$BASE_URL/shops" | head -c 100
echo ""

# Test 7: Get All Products
echo "7. Get All Products..."
curl -s -X GET "$BASE_URL/products" | head -c 100
echo ""

# Test 8: Get All Posts
echo "8. Get All Posts..."
curl -s -X GET "$BASE_URL/posts" | head -c 100
echo ""

# Test 9: Get All Services
echo "9. Get All Services..."
curl -s -X GET "$BASE_URL/services" | head -c 100
echo ""

# Test 10: Refresh Token
echo "10. Refresh Token..."
curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Authorization: Bearer $TOKEN" | head -c 100
echo ""

echo ""
echo "===== Basic API Tests Completed ====="
