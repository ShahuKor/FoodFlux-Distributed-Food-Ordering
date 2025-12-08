const express = require("express");
const { Pool } = require("pg");
const { Kafka } = require("kafkajs");

const app = express();
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: "localhost",
  port: 5433,
  database: "orders_db",
  user: "admin",
  password: "password",
});

// Kafka Setup
const kafka = new Kafka({
  clientId: "kitchen-service",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "kitchen-group" });
const producer = kafka.producer();

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kitchen_orders (
        id SERIAL PRIMARY KEY,
        order_id INTEGER UNIQUE NOT NULL,
        restaurant_id VARCHAR(255) NOT NULL,
        restaurant_name VARCHAR(255),
        items JSONB NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        received_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Kitchen database initialized");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};

// Kafka consumer start
const startConsumer = async () => {
  try {
    await consumer.connect();
    await producer.connect();
    console.log("Kafka consumer connected");

    await consumer.subscribe({ topic: "order-events", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());

        console.log(`Received event: ${event.eventType}`);

        if (event.eventType === "ORDER_PLACED") {
          console.log(`New order ${event.orderId} for ${event.restaurantName}`);

          try {
            // Store in kitchen database
            await pool.query(
              `INSERT INTO kitchen_orders (order_id, restaurant_id, restaurant_name, items, status)
               VALUES ($1, $2, $3, $4, 'PENDING')
               ON CONFLICT (order_id) DO NOTHING`,
              [
                event.orderId,
                event.restaurantId,
                event.restaurantName,
                JSON.stringify(event.items),
              ]
            );

            console.log(`Order ${event.orderId} added to kitchen queue`);
          } catch (error) {
            console.error("Failed to store kitchen order:", error);
          }
        }
      },
    });
  } catch (error) {
    console.error("Kafka consumer error:", error);
  }
};

// Initialise
initDB().then(() => startConsumer());

// HealthCheck Route
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "healthy", service: "kitchen-service" });
  } catch (error) {
    res.status(503).json({ status: "unhealthy", error: error.message });
  }
});

// Get Pending orders for a restaurant

// Get all pending orders trial

//update order status
