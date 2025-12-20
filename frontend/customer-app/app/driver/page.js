"use client";
import { useState, useEffect } from "react";
import { requireAuth } from "../middleware";

export default function Driver() {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    requireAuth("driver");
  }, []);

  const loadDeliveries = async () => {
    // Fetch ALL deliveries
    const availableRes = await fetch(
      "http://localhost:3005/deliveries/available"
    );
    const available = await availableRes.json();

    // fetch deliveries for driver
    const myDeliveriesRes = await fetch(
      "http://localhost:3005/deliveries/driver/100"
    );
    const myDeliveries = await myDeliveriesRes.json();

    // Combine and remove duplicates
    const all = [...available, ...myDeliveries].filter(
      (delivery, index, self) =>
        index === self.findIndex((d) => d.id === delivery.id)
    );

    setDeliveries(all);
  };

  useEffect(() => {
    loadDeliveries();
    const interval = setInterval(loadDeliveries, 3000);
    return () => clearInterval(interval);
  }, []);

  const acceptDelivery = async (id) => {
    await fetch(`http://localhost:3005/deliveries/${id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId: 100, driverName: "John Driver" }),
    });
    loadDeliveries();
  };

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:3005/deliveries/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadDeliveries();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-8">Driver Dashboard</h1>

      <div className="grid grid-cols-1 gap-4">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold">Delivery #{delivery.order_id}</h3>
            <p className="text-gray-600">{delivery.restaurant_name}</p>
            <p className="mt-2">📍 {delivery.delivery_address}</p>

            <span
              className={`inline-block mt-2 px-3 py-1 rounded font-bold ${
                delivery.status === "PENDING"
                  ? "bg-yellow-200"
                  : delivery.status === "ASSIGNED"
                  ? "bg-blue-200"
                  : delivery.status === "PICKED_UP"
                  ? "bg-orange-200"
                  : "bg-green-200"
              }`}
            >
              {delivery.status}
            </span>

            <div className="mt-4 flex gap-2">
              {delivery.status === "PENDING" && (
                <button
                  onClick={() => acceptDelivery(delivery.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Accept Delivery
                </button>
              )}
              {delivery.status === "ASSIGNED" && (
                <button
                  onClick={() => updateStatus(delivery.id, "PICKED_UP")}
                  className="bg-orange-500 text-white px-4 py-2 rounded"
                >
                  Mark Picked Up
                </button>
              )}
              {delivery.status === "PICKED_UP" && (
                <button
                  onClick={() => updateStatus(delivery.id, "DELIVERED")}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Mark Delivered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
