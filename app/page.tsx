"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

const models = [
  {
    id: "shopping-bag",
    title: "Canvas Tote Bag",
    category: "Bags",
    modelUrl: "/shopping.glb",
    description: "Premium canvas texture with high-fidelity detail."
  },
  {
    id: "tumbler",
    title: "Premium Tumbler",
    category: "Drinkware",
    modelUrl: "/hydro_flask_tumbler.glb",
    description: "Sleek matte finish with customizable branding zones."
  },
  {
    id: "t-shirt",
    title: "Essential T-Shirt",
    category: "Apparel",
    modelUrl: "/plain_dark_blue_t-shirt.glb",
    description: "Classic fit with realistic fabric simulation."
  },
  {
    id: "cap",
    title: "Elite Baseball Cap",
    category: "Headwear",
    modelUrl: "/baseball_cap.glb",
    description: "Structured design with precise stitch rendering."
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#050505]" />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
      {/* Simplified Hero Section */}
      <section className="pt-10 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            3D Product <br />
            <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              Customizer
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-0 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            High-fidelity interactive 3D models ready for your design.
            Upload logos, add text, and visualize your brand instantly.
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {models.map((model, index) => (
            <ProductCard 
              key={model.id}
              id={model.id}
              title={model.title}
              category={model.category}
              modelUrl={model.modelUrl}
              description={model.description}
              index={index}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
