"use client";

import { useEffect, useState } from "react";
import ModelPreview from "./ModelPreview";
import { ArrowRight, Box } from "lucide-react";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  title: string;
  category: string;
  modelUrl: string;
  description?: string;
  index?: number;
}

export default function ProductCard({
  id,
  title,
  category,
  modelUrl,
  description,
  index = 0
}: ProductCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-[24px] border border-white/5 bg-[#0a0a0a] shadow-sm hover:shadow-2xl hover:shadow-white/5 transition-all duration-500 animate-in fade-in slide-in-from-bottom-12"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Model Preview Container */}
      <div className="relative h-[280px] w-full overflow-hidden bg-[#f3f4f6] group-hover:bg-[#ebedef] transition-colors duration-500">
        <div className="absolute inset-0 z-10 transition-transform duration-700 group-hover:scale-110">
          {mounted && <ModelPreview modelUrl={modelUrl} title={title} />}
        </div>
        
        {/* Floating Category Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white shadow-lg">
          <Box size={12} className="text-gray-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">{category}</span>
        </div>

        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="flex flex-col p-6 bg-[#0a0a0a] relative z-20">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-bold text-white group-hover:text-gray-200 transition-colors">
            {title}
          </h3>
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
            <ArrowRight size={16} className="text-white group-hover:text-black" />
          </div>
        </div>
        
        <p className="text-gray-400 text-xs leading-relaxed mb-6 line-clamp-2">
          {description || "Explore and customize this high-quality 3D model with our advanced design tools."}
        </p>

        <Link
          href={`/customizer/${id}`}
          className="relative inline-flex items-center justify-center w-full px-5 py-3 overflow-hidden font-bold text-black transition-all duration-300 bg-white rounded-xl hover:bg-gray-200 active:scale-95 text-sm"
        >
          <span className="relative flex items-center gap-2">
            Customize in 3D
          </span>
        </Link>
      </div>
    </div>
  );
}
