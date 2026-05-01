"use client";

import React from "react";
import { Html } from "@react-three/drei";

const ModelSkeleton = ({ modelName, isPreview = false }: { modelName: string; isPreview?: boolean }) => {
  return (
    <Html center>
      <div className={`flex flex-col items-center justify-center pointer-events-none transition-all duration-700 ${isPreview ? 'scale-75' : 'scale-100'}`}>
        <div className="relative">
          <div className={`${isPreview ? 'w-32 h-32' : 'w-64 h-64 md:w-96 md:h-96'} rounded-full shimmer opacity-20 blur-3xl animate-pulse`} />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className={`${isPreview ? 'w-24 h-24' : 'w-40 h-40'} rounded-3xl shimmer opacity-40 rotate-45 animate-bounce-slow blur-sm`} />
            
            {!isPreview && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className="text-gray-400 font-bold tracking-[0.2em] text-[10px] uppercase animate-pulse">
                  Initializing Engine
                </div>
                <div className="text-gray-800 font-bold text-lg tracking-tight">
                  Loading {modelName}
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
          
          <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-gray-200 animate-ping" />
          <div className="absolute bottom-4 left-10 w-1.5 h-1.5 rounded-full bg-gray-200 animate-pulse delay-700" />
        </div>
      </div>
    </Html>
  );
};

export default ModelSkeleton;
