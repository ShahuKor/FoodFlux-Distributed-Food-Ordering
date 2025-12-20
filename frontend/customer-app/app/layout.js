"use client";
import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (!mounted) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <nav className="bg-blue-500 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex gap-4">
              {!user && (
                <Link href="/login" className="hover:underline">
                  Login
                </Link>
              )}

              {user?.role === "customer" && (
                <Link href="/" className="hover:underline text-2xl">
                  Home
                </Link>
              )}

              {user?.role === "restaurant" && (
                <Link href="/kitchen" className="hover:underline text-2xl">
                  Kitchen
                </Link>
              )}

              {user?.role === "driver" && (
                <Link href="/driver" className="hover:underline text-2xl">
                  Driver
                </Link>
              )}
            </div>

            {user && (
              <div className="flex gap-4 items-center">
                <span>
                  👤 {user.email} ({user.role})
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
