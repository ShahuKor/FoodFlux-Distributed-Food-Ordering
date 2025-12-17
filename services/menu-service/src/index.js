const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = process.env.MONGO_DB_NAME || "foodflux";
let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl)
  .then((client) => {
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

// Health check route
app.get("/health", (req, res) => {
  if (db) {
    res.json({ status: "healthy", service: "menu-service" });
  } else {
    res
      .status(503)
      .json({ status: "unhealthy", error: "Database not connected" });
  }
});

// Get all restaurants
app.get("/restaurants", async (req, res) => {
  try {
    const restaurants = await db.collection("restaurants").find().toArray();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
});

// Get single restaurant
app.get("/restaurants/:id", async (req, res) => {
  try {
    const restaurant = await db.collection("restaurants").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch restaurant" });
  }
});

// Get menu for a restaurant
app.get("/restaurants/:id/menu", async (req, res) => {
  try {
    const menuItems = await db
      .collection("menu_items")
      .find({ restaurantId: req.params.id })
      .toArray();

    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// Create restaurant (admin only - no auth check for now)
app.post("/restaurants", async (req, res) => {
  try {
    const { name, address, cuisine, imageUrl } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: "Name and address are required" });
    }

    const result = await db.collection("restaurants").insertOne({
      name,
      address,
      cuisine: cuisine || "General",
      imageUrl: imageUrl || "https://via.placeholder.com/300",
      isActive: true,
      rating: 0,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Restaurant created",
      id: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create restaurant" });
  }
});

// Add menu item
app.post("/menu-items", async (req, res) => {
  try {
    const { restaurantId, name, description, price, category, imageUrl } =
      req.body;

    if (!restaurantId || !name || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await db.collection("menu_items").insertOne({
      restaurantId,
      name,
      description: description || "",
      price: parseFloat(price),
      category: category || "Other",
      imageUrl: imageUrl || "https://via.placeholder.com/200",
      isAvailable: true,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "Menu item created",
      id: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create menu item" });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(` Menu Service running on port ${PORT}`);
});
