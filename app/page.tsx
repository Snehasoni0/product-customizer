"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { MessageSquare } from "lucide-react";

const models = [
  {
    id: "shopping-bag",
    title: "Canvas Tote Bag",
    category: "Bags",
    modelUrl: "/shopping.glb",
    imageUrl: "/shopping-bag.png",
    description: "Premium canvas texture with high-fidelity detail."
  },
  {
    id: "tumbler",
    title: "Premium Tumbler",
    category: "Drinkware",
    modelUrl: "/hydro_flask_tumbler.glb",
    imageUrl: "/tumbler.png",
    description: "Sleek matte finish with customizable branding zones."
  },
  {
    id: "t-shirt",
    title: "Essential T-Shirt",
    category: "Apparel",
    modelUrl: "/plain_dark_blue_t-shirt.glb",
    imageUrl: "/tshirt.png",
    description: "Classic fit with realistic fabric simulation."
  },
  {
    id: "cap",
    title: "Elite Baseball Cap",
    category: "Headwear",
    modelUrl: "/baseball_cap.glb",
    imageUrl: "/cap.png",
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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black relative">
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 pointer-events-none">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/20 rounded-full px-8 flex items-center justify-between shadow-[0_10px_40px_rgba(255,107,0,0.15)] hover:border-white/30 transition-all pointer-events-auto">
            <div className="w-32 h-16 relative">
              <img 
                src="/shape byteS.svg" 
                alt="Shapebytes Logo" 
                className="w-full h-full object-contain brightness-110"
              />
            </div>

          <a 
            href="https://mail.google.com/mail/?view=cm&fs=1&to=growth@shapebytes.com"
  target="_blank"
            className="flex items-center gap-2 bg-[#ff6b00] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ff8533] hover:shadow-[0_0_20px_rgba(255,107,0,0.4)] transition-all active:scale-95 group cursor-pointer"
          >
            <MessageSquare size={14} className="group-hover:rotate-12 transition-transform" />
            Contact Us
          </a>
        </div>
      </div>

      <section className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            3D Product <br />
            <span className="bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
              Customizer
            </span>
          </h1>
          
          <div className="w-16 h-1 bg-[#ff6b00] mx-auto mb-8 rounded-full animate-in fade-in zoom-in duration-1000 delay-300" />

          <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-0 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            High-fidelity interactive 3D models ready for your design.
            Upload logos, add text, and visualize your brand instantly.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {models.map((model, index) => (
            <ProductCard 
              key={model.id}
              id={model.id}
              title={model.title}
              category={model.category}
              modelUrl={model.modelUrl}
              imageUrl={model.imageUrl}
              description={model.description}
              index={index}
            />
          ))}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-white/5  text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          © 2026 Shapebytes All right reserved
        </p>
      </footer>
    </div>
  );
}
