#!/bin/bash

echo "Setting up FoodFlux demo data..."
echo ""

# Wait for services to be ready
echo "Waiting for services to start (5 seconds)..."
sleep 5

# Create users
echo "Creating demo users..."

# Create customer
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123",
    "role": "customer"
  }' 2>/dev/null

echo ""

# Create restaurant staff
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "restaurant@test.com",
    "password": "password123",
    "role": "restaurant"
  }' 2>/dev/null

echo ""

# Create driver
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver@test.com",
    "password": "password123",
    "role": "driver"
  }' 2>/dev/null

echo ""
echo "Users created successfully!"
echo ""

# Create restaurant
echo "Creating restaurant..."

RESTAURANT_RESPONSE=$(curl -X POST http://localhost:3002/restaurants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pizza Palace",
    "address": "123 Main St, Dublin",
    "cuisine": "Italian"
  }' 2>/dev/null)

echo "$RESTAURANT_RESPONSE"
echo ""

# Extract restaurant ID 
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  RESTAURANT_ID=$(echo "$RESTAURANT_RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | sed 's/"_id":"//')
else
  # Linux
  RESTAURANT_ID=$(echo "$RESTAURANT_RESPONSE" | grep -oP '"_id":"\K[^"]+' | head -1)
fi

if [ -z "$RESTAURANT_ID" ]; then
  echo "Failed to extract restaurant ID. Please check if Menu Service is running."
  echo "   Run: curl http://localhost:3002/health"
  exit 1
fi

echo "Restaurant created with ID: $RESTAURANT_ID"
echo ""

# Create menu items
echo "Adding menu items..."

# Margherita Pizza
curl -X POST http://localhost:3002/menu-items \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurantId\": \"$RESTAURANT_ID\",
    \"name\": \"Margherita Pizza\",
    \"description\": \"Classic tomato and mozzarella\",
    \"price\": 12.99,
    \"category\": \"Pizza\",
    \"available\": true
  }" 2>/dev/null

echo ""

# Pepperoni Pizza
curl -X POST http://localhost:3002/menu-items \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurantId\": \"$RESTAURANT_ID\",
    \"name\": \"Pepperoni Pizza\",
    \"description\": \"Spicy pepperoni with cheese\",
    \"price\": 14.99,
    \"category\": \"Pizza\",
    \"available\": true
  }" 2>/dev/null

echo ""

# Vegetarian Pizza
curl -X POST http://localhost:3002/menu-items \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurantId\": \"$RESTAURANT_ID\",
    \"name\": \"Vegetarian Pizza\",
    \"description\": \"Fresh vegetables and cheese\",
    \"price\": 13.99,
    \"category\": \"Pizza\",
    \"available\": true
  }" 2>/dev/null

echo ""

# Caesar Salad
curl -X POST http://localhost:3002/menu-items \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurantId\": \"$RESTAURANT_ID\",
    \"name\": \"Caesar Salad\",
    \"description\": \"Fresh romaine lettuce with Caesar dressing\",
    \"price\": 8.99,
    \"category\": \"Salads\",
    \"available\": true
  }" 2>/dev/null

echo ""

# Garlic Bread
curl -X POST http://localhost:3002/menu-items \
  -H "Content-Type: application/json" \
  -d "{
    \"restaurantId\": \"$RESTAURANT_ID\",
    \"name\": \"Garlic Bread\",
    \"description\": \"Toasted bread with garlic butter\",
    \"price\": 5.99,
    \"category\": \"Sides\",
    \"available\": true
  }" 2>/dev/null

echo ""

echo "Menu items created successfully!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Demo data setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Demo Credentials:"
echo "   Customer:   customer@test.com / password123"
echo "   Restaurant: restaurant@test.com / password123"
echo "   Driver:     driver@test.com / password123"
echo ""
echo "Access the application:"
echo "   Customer:  http://localhost:3000"
echo "   Kitchen:   http://localhost:3000/kitchen"
echo "   Driver:    http://localhost:3000/driver"
echo "   Login:     http://localhost:3000/login"
echo ""
echo "Restaurant:"
echo "   Name: Pizza Palace"
echo "   ID:   $RESTAURANT_ID"
echo "   Menu: 5 items (3 pizzas, 1 salad, 1 side)"
echo ""
echo "Ready to order! Enjoy your meal!"
echo ""
