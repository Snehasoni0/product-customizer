"use client";

import { useEffect, useState } from "react";
import ModelPreview from "./ModelPreview";

interface ProductCardProps {
  id: string;
  title: string;
  category: string;
  modelUrl: string;
}

export default function ProductCard({
  id,
  title,
  category,
  modelUrl,
}: ProductCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "24px",
        border: "1px solid #e5e5e7",
        backgroundColor: "white",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }}
    >
      <div
        style={{
          position: "relative",
          height: "320px",
          width: "100%",
          overflow: "hidden",
          backgroundColor: "#9ca3af",
        }}
      >
        {mounted && <ModelPreview modelUrl={modelUrl} />}
      </div>

      <div
        style={{ padding: "24px", display: "flex", flexDirection: "column" }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#86868b",
            marginBottom: "4px",
          }}
        >
          {category}
        </span>
        <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#1d1d1f" }}>
          {title}
        </h3>

        <div style={{ marginTop: "24px" }}>
          <button
            onClick={() => window.location.href = `/customizer/${id}`}
            style={{
              width: "100%",
              borderRadius: "12px",
              backgroundColor: "#1d1d1f",
              padding: "12px 0",
              fontSize: "14px",
              fontWeight: "600",
              color: "white",
              border: "none",
              cursor: "pointer",
              textAlign: "center",
              display: "block",
              textDecoration: "none"
            }}
          >
            View Customizer
          </button>
        </div>
      </div>
    </div>
  );
}
