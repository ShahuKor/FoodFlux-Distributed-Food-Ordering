"use client";
import { useState, useEffect } from "react";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const res = await fetch("http://localhost:3004/kitchen/orders");
    const data = await res.json();
    setOrders(data);
  };

  const updateStatus = async (orderId, status) => {
    await fetch(`http://localhost:3004/kitchen/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-8">Kitchen Dashboard</h1>

      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Order #{order.order_id}</h3>
                <p className="text-gray-600">{order.restaurant_name}</p>
                <div className="mt-2">
                  {JSON.parse(order.items).map((item, i) => (
                    <p key={i}>
                      • {item.name} x{item.quantity}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <span
                  className={`px-3 py-1 rounded font-bold ${
                    order.status === "PENDING"
                      ? "bg-yellow-200"
                      : order.status === "COOKING"
                      ? "bg-orange-200"
                      : "bg-green-200"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {order.status === "PENDING" && (
                <button
                  onClick={() => updateStatus(order.id, "ACCEPTED")}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Accept
                </button>
              )}
              {order.status === "ACCEPTED" && (
                <button
                  onClick={() => updateStatus(order.id, "COOKING")}
                  className="bg-orange-500 text-white px-4 py-2 rounded"
                >
                  Start Cooking
                </button>
              )}
              {order.status === "COOKING" && (
                <button
                  onClick={() => updateStatus(order.id, "READY")}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Mark Ready
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
