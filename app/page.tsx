"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

const models = [
  {
    id: "cap",
    title: "Elite Baseball Cap",
    category: "Headwear",
    modelUrl: "/baseball_cap.glb",
  },
  {
    id: "tumbler",
    title: "Premium Tumbler",
    category: "Drinkware",
    modelUrl: "/hydro_flask_tumbler.glb",
  },
  {
    id: "paper-bag",
    title: "Eco-Friendly Bag",
    category: "Packaging",
    modelUrl: "/paper_bag.glb",
  },
  {
    id: "t-shirt",
    title: "Essential T-Shirt",
    category: "Apparel",
    modelUrl: "/plain_dark_blue_t-shirt.glb",
  },
  {
    id: "shopping-bag",
    title: "Canvas Tote Bag",
    category: "Bags",
    modelUrl: "/shopping.glb",
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return early or null during SSR to avoid any hydration mismatch with 3D components
  if (!mounted) {
    return (
      <div style={{ backgroundColor: "#fbfbfd", minHeight: "100vh" }} />
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#fbfbfd",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <header style={{ maxWidth: "1200px", margin: "0 auto 60px auto", textAlign: "center" }}>
        <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#1d1d1f", letterSpacing: "-0.02em" }}>
          Product Customizer
        </h1>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "32px",
          }}
        >
          {models.map((model) => (
            <ProductCard 
              key={model.id}
              id={model.id}
              title={model.title}
              category={model.category}
              modelUrl={model.modelUrl}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
