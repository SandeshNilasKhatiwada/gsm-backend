#!/bin/bash

# API Testing Script
# This script tests all major endpoints of the marketplace API

BASE_URL="http://localhost:5000/api"
echo "🧪 Testing Marketplace API at $BASE_URL"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local headers="$5"
    local expected_code="$6"
    
    echo -n "Testing: $name ... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" $headers)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            $headers \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "$expected_code" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_code, got $http_code)"
        echo "  Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "📡 1. Testing Health Check"
echo "----------------------------"
test_endpoint "Health check" "GET" "/health" "" "" "200"
echo ""

echo "🔐 2. Testing Authentication"
echo "----------------------------"
# Register new user
RANDOM_EMAIL="user$(date +%s)@test.com"
RANDOM_USERNAME="user$(date +%s)"
test_endpoint "Register new user" "POST" "/auth/register" \
    "{\"email\":\"$RANDOM_EMAIL\",\"username\":\"$RANDOM_USERNAME\",\"password\":\"Test123!\",\"confirmPassword\":\"Test123!\",\"firstName\":\"Test\",\"lastName\":\"User\",\"phoneNumber\":\"1234567890\"}" \
    "" "201"

# Try to register duplicate
test_endpoint "Register duplicate email (should fail)" "POST" "/auth/register" \
    "{\"email\":\"$RANDOM_EMAIL\",\"username\":\"another_user\",\"password\":\"Test123!\",\"confirmPassword\":\"Test123!\",\"firstName\":\"Test\",\"lastName\":\"User\",\"phoneNumber\":\"1234567890\"}" \
    "" "400"

# Login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test123!\"}")
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

test_endpoint "Login with correct password" "POST" "/auth/login" \
    "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"Test123!\"}" \
    "" "200"

test_endpoint "Login with wrong password (should fail)" "POST" "/auth/login" \
    "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"WrongPassword123!\"}" \
    "" "401"

test_endpoint "Login with non-existent email (should fail)" "POST" "/auth/login" \
    "{\"email\":\"nonexistent@test.com\",\"password\":\"Test123!\"}" \
    "" "401"

echo ""

echo "👤 3. Testing User Endpoints"
echo "----------------------------"
test_endpoint "Get current user profile" "GET" "/auth/profile" "" \
    "-H 'Authorization: Bearer $TOKEN'" "200"

test_endpoint "Get all users" "GET" "/users" "" \
    "-H 'Authorization: Bearer $TOKEN'" "200"

echo ""

echo "🏪 4. Testing Shop Endpoints"
echo "----------------------------"
SHOP_NAME="Shop$(date +%s)"
SHOP_RESPONSE=$(curl -s -X POST "$BASE_URL/shops" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"name\":\"$SHOP_NAME\",\"description\":\"Test shop\",\"address\":\"123 Test St\",\"phone\":\"1234567890\",\"email\":\"shop@test.com\"}")
SHOP_ID=$(echo $SHOP_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

test_endpoint "Create shop" "POST" "/shops" \
    "{\"name\":\"AnotherShop$(date +%s)\",\"description\":\"Another test shop\",\"address\":\"456 Main St\",\"phone\":\"9876543210\",\"email\":\"another@shop.com\"}" \
    "-H 'Authorization: Bearer $TOKEN'" "201"

test_endpoint "Get all shops" "GET" "/shops" "" "" "200"

if [ ! -z "$SHOP_ID" ]; then
    test_endpoint "Get shop by ID" "GET" "/shops/$SHOP_ID" "" "" "200"
fi

echo ""

echo "📦 5. Testing Product Endpoints"
echo "----------------------------"
if [ ! -z "$SHOP_ID" ]; then
    test_endpoint "Create product" "POST" "/products" \
        "{\"shopId\":\"$SHOP_ID\",\"name\":\"Test Product\",\"description\":\"A test product\",\"price\":99.99,\"quantity\":10,\"category\":\"electronics\"}" \
        "-H 'Authorization: Bearer $TOKEN'" "201"
    
    test_endpoint "Get all products" "GET" "/products" "" "" "200"
fi

echo ""

echo "📝 6. Testing Post Endpoints"
echo "----------------------------"
test_endpoint "Create personal post" "POST" "/posts" \
    "{\"title\":\"My First Post\",\"content\":\"This is a test post\",\"excerpt\":\"Test excerpt\",\"postType\":\"article\",\"status\":\"published\"}" \
    "-H 'Authorization: Bearer $TOKEN'" "201"

test_endpoint "Get all posts" "GET" "/posts" "" "" "200"

echo ""

echo "📊 7. Testing Error Handling"
echo "----------------------------"
test_endpoint "Get non-existent user (404)" "GET" "/users/00000000-0000-0000-0000-000000000000" "" \
    "-H 'Authorization: Bearer $TOKEN'" "404"

test_endpoint "Get non-existent shop (404)" "GET" "/shops/00000000-0000-0000-0000-000000000000" "" "" "404"

test_endpoint "Access protected route without token (401)" "GET" "/auth/profile" "" "" "401"

echo ""
echo "========================================"
echo "📊 Test Results Summary"
echo "========================================"
echo -e "${GREEN}✓ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}✗ Failed: $TESTS_FAILED${NC}"
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
PASS_RATE=$((TESTS_PASSED * 100 / TOTAL))
echo "Pass Rate: $PASS_RATE%"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the output above.${NC}"
    exit 1
fi
