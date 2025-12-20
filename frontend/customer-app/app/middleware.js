export function requireAuth(role) {
  if (typeof window === "undefined") return null;

  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  if (role && user.role !== role) {
    alert("Access denied");
    window.location.href = "/";
    return null;
  }

  return user;
}
