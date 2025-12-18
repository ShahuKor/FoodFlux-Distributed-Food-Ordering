export const metadata = {
  title: "FoodFlux",
  description: "Distributed Food Ordering System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
