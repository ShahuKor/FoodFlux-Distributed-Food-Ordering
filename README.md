
# FoodFlux - Distributed Food Ordering Platform

A distributed microservices-based food ordering system demonstrating event-driven architecture, fault tolerance patterns, and real-time notifications. 

## Table of Contents

- [System Overview](#system-overview)
- [Services and Infrastructure](#services-and-infrastructure)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment Options](#deployment-options)
- [Demo Credentials](#demo-credentials)
- [Features](#features)
- [Fault Tolerance Demo](#fault-tolerance-demo)
- [API Endpoints](#api-endpoints)

---

## System Overview

FoodFlux is a distributed food ordering platform that enables customers to browse restaurants, place orders, and track deliveries in real-time. The system demonstrates key distributed systems concepts including:

- **Event-Driven Architecture** using Kafka for asynchronous communication
- **Fault Tolerance** with circuit breaker pattern for graceful degradation
- **Microservices Architecture** with 6 independent services
- **Real-Time Notifications** via WebSocket connections
- **Role-Based Access Control** for customers, restaurant staff, and drivers

---

## Services and Infrastructure

### Services

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| **Auth Service** | 3001 | PostgreSQL | User authentication, JWT token generation, role-based access control |
| **Menu Service** | 3002 | MongoDB | Restaurant and menu item management, browsing functionality |
| **Order Service** | 3003 | PostgreSQL | Order creation with circuit breaker, menu validation, event publishing |
| **Kitchen Service** | 3004 | PostgreSQL | Order queue management, status updates, kitchen workflow |
| **Delivery Service** | 3005 | PostgreSQL | Driver assignment, delivery tracking, status management |
| **Notification Service** | 3006 | N/A | Real-time WebSocket notifications to customers |

### Infrastructure

- **PostgreSQL** (Port 5433) - Relational data storage
- **MongoDB** (Port 27017) - Document storage for restaurants/menus
- **Kafka** (Port 9092) - Event streaming platform
- **Zookeeper** (Port 2181) - Kafka coordination

---

## Technologies Used

### Backend
- **Node.js** 18+ - Runtime environment
- **Express.js** - REST API framework
- **Kafka** (KafkaJS) - Event streaming
- **PostgreSQL** (pg) - Relational database
- **MongoDB** (Mongoose) - Document database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Socket.io** - WebSocket server
- **Opossum** - Circuit breaker library

### Frontend
- **Next.js** - React framework
- **React** - UI library
- **Tailwind CSS** - Styling
- **Socket.io-client** - WebSocket client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Local orchestration
- **Kubernetes** - Production orchestration 

---

## Prerequisites

Before running the application, ensure you have:

- **Docker Desktop** (with Kubernetes enabled for K8s deployment)
- **Node.js** 
- **npm** or **yarn**
- **Terminal/Command Prompt**
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

---

## Quick Start

### Option 1: Manual Service Startup 

This approach provides the best visibility into service logs and is ideal for demonstrations.

#### Step 1: Start Infrastructure

```bash
cd infra
docker-compose up -d
```

**Verify all containers are running:**
```bash
docker-compose ps
```

You should see: `postgres`, `mongodb`, `kafka`, `zookeeper` all running.

#### Step 2: Start All Microservices

Open **6 separate terminal windows** and run each service:

**Terminal 1 - Auth Service:**
```bash
cd services/auth-service
npm install
node src/index.js
```

**Terminal 2 - Menu Service:**
```bash
cd services/menu-service
npm install
node src/index.js
```

**Terminal 3 - Order Service:**
```bash
cd services/order-service
npm install
node src/index.js
```

**Terminal 4 - Kitchen Service:**
```bash
cd services/kitchen-service
npm install
node src/index.js
```

**Terminal 5 - Delivery Service:**
```bash
cd services/delivery-service
npm install
node src/index.js
```

**Terminal 6 - Notification Service:**
```bash
cd services/notification-service
npm install
node src/index.js
```

**Verify all services are healthy:**
```bash
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # Menu
curl http://localhost:3003/health  # Order
curl http://localhost:3004/health  # Kitchen
curl http://localhost:3005/health  # Delivery
curl http://localhost:3006/health  # Notification
```

#### Step 3: Setup Demo Data

Make the setup script executable and run it:

```bash
cd infra/scripts
chmod +x setup-demo-data.sh
./setup-demo-data.sh
```

This script will:
- Create demo users (customer, restaurant staff, driver)
- Create a sample restaurant ("Pizza Palace")
- Add menu items (pizzas, salads)

#### Step 4: Start Frontend

```bash
cd frontend/customer-app
npm install
npm run dev
```

#### Step 5: Access the Application

- **Login Page:** http://localhost:3000/login
- **Customer Portal:** http://localhost:3000
- **Kitchen Dashboard:** http://localhost:3000/kitchen
- **Driver Dashboard:** http://localhost:3000/driver


---

## Deployment Options

### Option 2: Docker Compose (Full Containerization)

Run all services in Docker containers:

```bash
cd infra
docker-compose up --build
```

### Option 3: Kubernetes (Production-Ready)

Production-ready Kubernetes manifests are provided in `/infra/k8s/`.

```bash
# Start Minikube
minikube start --memory=4096 --cpus=4
eval $(minikube docker-env)

# Build images in Minikube's Docker
docker build -t foodflux/auth-service:latest ./services/auth-service
docker build -t foodflux/menu-service:latest ./services/menu-service
docker build -t foodflux/order-service:latest ./services/order-service
docker build -t foodflux/kitchen-service:latest ./services/kitchen-service
docker build -t foodflux/delivery-service:latest ./services/delivery-service
docker build -t foodflux/notification-service:latest ./services/notification-service

# Deploy to Kubernetes
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/infrastructure/
kubectl apply -f infra/k8s/services/

# Check deployment status
kubectl get all -n foodflux
kubectl get pods -n foodflux -w
```
---

## Demo Credentials

Use these credentials to test different user roles:

| Role | Email | Password |
|------|-------|----------|
| **Customer** | customer@test.com | password123 |
| **Restaurant Staff** | restaurant@test.com | password123 |
| **Driver** | driver@test.com | password123 |

---

## Features

### Customer Features
- Browse available restaurants
- View restaurant menus with prices
- Add items to shopping cart
- Remove items from cart
- Place orders with delivery address
- Real-time order status notifications (WebSocket)
- Order tracking (Placed → Cooking → Ready → Delivered)

### Kitchen Features
- View incoming orders in real-time
- Accept or decline orders
- Update order status (Cooking → Ready)
- Clear completed orders from queue
- Auto-refresh order list every 3 seconds

### Driver Features
- View available deliveries
- Accept delivery assignments
- Update delivery status (Picked Up → Delivered)
- Track active deliveries
- Auto-refresh delivery list every 3 seconds

### System Features
- **Circuit Breaker:** Graceful degradation when Menu Service fails
- **Event-Driven:** Kafka for asynchronous service communication
- **Fault Tolerance:** Automatic retry with exponential backoff
- **Real-Time Updates:** WebSocket notifications to customers
- **Role-Based Access:** JWT authentication with customer/restaurant/driver roles
- **Service Independence:** Services can be deployed/scaled independently

---

## Fault Tolerance Demo

### Demonstrating Circuit Breaker Pattern

The Order Service implements a circuit breaker to protect against Menu Service failures.

#### Test Scenario:

**1. Normal Operation (All Services Running)**

Place an order - it should succeed with menu validation:

```
[Order Service] Validating menu items...
[Order Service] Item Margherita Pizza validated
[Order Service] Order placed successfully
[Circuit Breaker] State: CLOSED
```

**2. Menu Service Failure (Graceful Degradation)**

Stop Menu Service:
```bash
# Find Menu Service terminal and press Ctrl+C
# OR
ps aux | grep menu-service
kill <PID>
```

Place another order - it should STILL succeed using fallback:

```
[Order Service] Menu Service failed: ECONNREFUSED
[Circuit Breaker] Circuit OPENED - Menu Service is down
[Order Service] Using fallback - skipping menu validation
[Order Service] Order placed with skipped validation
[Circuit Breaker] State: OPEN
```

**Key Observation:** Order succeeds despite Menu Service being down!

**3. Automatic Recovery**

Restart Menu Service:
```bash
cd services/menu-service
node src/index.js
```

Wait 10 seconds, then place another order:

```
[Circuit Breaker] Circuit HALF-OPEN - Testing Menu Service
[Order Service] Item Margherita Pizza validated
[Circuit Breaker] Circuit CLOSED - Menu Service is healthy
[Order Service] Normal operation resumed
```

**Circuit breaker automatically detected recovery and closed!**

---

## API Endpoints

### Auth Service (Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/health` | Health check |

### Menu Service (Port 3002)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/restaurants` | List all restaurants |
| GET | `/restaurants/:id` | Get restaurant details |
| POST | `/restaurants` | Create new restaurant |
| GET | `/restaurants/:id/menu` | Get restaurant menu |
| GET | `/menu-items/:id` | Get menu item details |
| POST | `/menu-items` | Create new menu item |
| GET | `/health` | Health check |

### Order Service (Port 3003)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create new order (with circuit breaker) |
| GET | `/orders/:id` | Get order details |
| GET | `/health` | Health check |

### Kitchen Service (Port 3004)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kitchen/orders` | Get all kitchen orders |
| PATCH | `/kitchen/orders/:id/status` | Update order status |
| DELETE | `/kitchen/orders/clear-all` | Clear all orders |
| GET | `/health` | Health check |

### Delivery Service (Port 3005)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/deliveries/available` | Get available deliveries |
| GET | `/deliveries/driver/:id` | Get driver's deliveries |
| POST | `/deliveries/:id/assign` | Assign driver to delivery |
| PATCH | `/deliveries/:id/status` | Update delivery status |
| GET | `/health` | Health check |

### Notification Service (Port 3006)

| Protocol | Endpoint | Description |
|----------|----------|-------------|
| WebSocket | `/` | Real-time notifications |
| GET | `/health` | Health check |

---

## Project Structure

```
foodflux/
├── frontend/
│   └── customer-app/          # Next.js frontend
│       ├── app/
│       │   ├── page.js        # Customer dashboard
│       │   ├── kitchen/       # Kitchen dashboard
│       │   ├── driver/        # Driver dashboard
│       │   └── login/         # Login page
│       └── package.json
├── services/
│   ├── auth-service/          # Authentication service
│   ├── menu-service/          # Restaurant/menu management
│   ├── order-service/         # Order processing + circuit breaker
│   ├── kitchen-service/       # Kitchen order management
│   ├── delivery-service/      # Delivery coordination
│   └── notification-service/  # WebSocket notifications
├── infra/
│   ├── docker-compose.yml     # Infrastructure setup
│   ├── k8s/                   # Kubernetes manifests
│   └── scripts/
│       └── setup-demo-data.sh # Demo data script
└── README.md
```

---

---

## Contributors

- Shahu Kor - 25203580
- Hardhik Gattu - 24213959
---
