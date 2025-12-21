"use client";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import { requireAuth } from "./middleware";

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  useEffect(() => {
    requireAuth("customer");
  }, []);

  // Fetch restaurants
  useEffect(() => {
    fetch("http://localhost:3002/restaurants")
      .then((res) => res.json())
      .then((data) => setRestaurants(data));
  }, []);

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };
  useEffect(() => {
    const socket = io("http://localhost:3006");

    socket.on("connect", () => {
      console.log("Connected to notifications");
      socket.emit("register", 1); // userId = 1
    });

    socket.on("order-update", (notification) => {
      console.log("Order update:", notification);
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  // Fetch menu when restaurant selected
  const selectRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    const res = await fetch(
      `http://localhost:3002/restaurants/${restaurant._id}/menu`
    );
    const items = await res.json();
    setMenuItems(items);
  };

  // Add to cart
  const addToCart = (item) => {
    setCart([...cart, { ...item, quantity: 1 }]);
  };

  // Place order
  const placeOrder = async () => {
    const order = {
      userId: 1,
      restaurantId: selectedRestaurant._id,
      restaurantName: selectedRestaurant.name,
      items: cart,
      totalAmount: cart.reduce((sum, item) => sum + item.price, 0),
      deliveryAddress: "123 Test St, Dublin",
    };

    const res = await fetch("http://localhost:3003/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    if (res.ok) {
      setOrderPlaced(true);
      setCart([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-8">FoodFlux</h1>

      {orderPlaced && (
        <div className="bg-green-100 p-4 rounded mb-4">
          Order placed successfully!
        </div>
      )}
      {notifications.length > 0 && (
    <div className="bg-blue-100 p-4 rounded mb-4">
      <h3 className="font-bold mb-2">Order Updates:</h3>
      {notifications.slice(0, 5).map((notif, i) => {
        let message = "";
        let emoji = "📦";

        switch (notif.type) {
          case "ORDER_PLACED":
            message = `Order #${notif.orderId} has been placed`;
            emoji = "✅";
            break;
          case "ORDER_STATUS_UPDATED":
            if (notif.data.status === "ACCEPTED") {
              message = `Order #${notif.orderId} accepted by restaurant`;
              emoji = "👨‍🍳";
            } else if (notif.data.status === "COOKING") {
              message = `Order #${notif.orderId} is being prepared`;
              emoji = "🍳";
            } else if (notif.data.status === "READY") {
              message = `Order #${notif.orderId} is ready! Waiting for driver`;
              emoji = "🎉";
            } else if (notif.data.status === "DECLINED") {
              message = `Order #${notif.orderId} was declined by restaurant`;
              emoji = "❌";
            }
            break;
          case "DELIVERY_CREATED":
            message = `Delivery created for order #${notif.orderId}`;
            emoji = "🚚";
            break;
          case "DELIVERY_ASSIGNED":
            message = `Driver assigned to order #${notif.orderId}`;
            emoji = "👤";
            break;
          case "DELIVERY_STATUS_UPDATED":
            if (notif.data.status === "PICKED_UP") {
              message = `Order #${notif.orderId} picked up by driver`;
              emoji = "🏃";
            } else if (notif.data.status === "DELIVERED") {
              message = `Order #${notif.orderId} delivered! Enjoy your meal!`;
              emoji = "✅";
            }
            break;
          default:
            message = `${notif.type} - Order #${notif.orderId}`;
        }

        return (
          <div
            key={i}
            className="text-sm py-1 border-b border-blue-200 last:border-0"
          >
            <span className="mr-2">{emoji}</span>
            {message}
          </div>
        );
      })}
    </div>
  )
}


      <div className="grid grid-cols-3 gap-8">
        {/* Restaurants */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Restaurants</h2>
          {restaurants.map((r) => (
            <div
              key={r._id}
              onClick={() => selectRestaurant(r)}
              className="bg-white p-4 rounded shadow mb-2 cursor-pointer hover:bg-blue-50"
            >
              <h3 className="font-bold">{r.name}</h3>
              <p className="text-sm text-gray-600">{r.cuisine}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Menu</h2>
          {menuItems.map((item) => (
            <div key={item._id} className="bg-white p-4 rounded shadow mb-2">
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-lg font-bold text-green-600">${item.price}</p>
              <button
                onClick={() => addToCart(item)}
                className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        {/* Cart */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Cart ({cart.length})</h2>
          {cart.map((item, i) => (
            <div key={i} className="bg-white p-2 rounded shadow mb-2">
              <p>
                {item.name} - ${item.price}
              </p>
              <button
                onClick={() => removeFromCart(i)}
                className="text-red-500 font-bold"
              >
                Remove
              </button>
            </div>
          ))}

          {cart.length > 0 && (
            <div className="mt-4">
              <p className="font-bold text-xl mb-2">
                Total: $
                {cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </p>
              <button
                onClick={placeOrder}
                className="bg-green-500 text-white px-6 py-3 rounded w-full font-bold"
              >
                Place Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
