"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { Canvas, createPortal } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Center,
  Environment,
  ContactShadows,
  Html,
  Decal,
} from "@react-three/drei";
import * as THREE from "three";
import { useParams } from "next/navigation";
import { Upload, Type, Move, Palette, Maximize, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Model Components
import Cap from "@/components/models/Cap";
import Tumbler from "@/components/models/Tumbler";
import PaperBag from "@/components/models/PaperBag";
import TShirt from "@/components/models/TShirt";
import ShoppingBag from "@/components/models/ShoppingBag";

// ------------------ UI HELPERS ------------------

const ControlGroup = ({ title, icon: Icon, children }: any) => (
  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
    <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
      <Icon size={18} />
      <span>{title}</span>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Slider = ({ label, value, min, max, step = 0.01, onChange }: any) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-xs text-gray-500 uppercase font-medium">
      <label>{label}</label>
      <span>{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
    />
  </div>
);

// ------------------ MAIN PAGE ------------------

export default function CustomizerPage() {
  const { id } = useParams();

  const [color, setColor] = useState("#ffffff");
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");

  useEffect(() => {
    // Reset to defaults for other models
    setTextPosX(0);
    setTextPosY(0.1);
    setImageSize(0.3);
    setImgPosX(0);
    setImgPosY(0.3);
    setImgRot(0);

    if (id === "cap") {
      setText("CAP");
    } else if (id === "t-shirt") {
      setText("T SHIRT");
      setTextPosX(0.66);
      setTextPosY(-0.43);
      setImageSize(0.3);
      setImgPosX(-1.01);
      setImgPosY(-0.24);
      setImgRot(0.248407346410207);
    } else if (id === "paper-bag") {
      setText("PAPER BAG");
      setTextSize(0.29);
      setTextPosX(-1.01);
      setTextPosY(-0.31);
      setTextRot(-0.511592653589793);
      setImageSize(0.23);
      setImgPosX(-1.34);
      setImgPosY(-0.5);
      setImgRot(-0.531592653589793);
    } else if (id) {
      setText(id.toString().toUpperCase().replace("-", " "));
    }
  }, [id]);
  const [fontSize, setFontSize] = useState(100);
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [textSize, setTextSize] = useState(0.4);
  const [textPosX, setTextPosX] = useState(0);
  const [textPosY, setTextPosY] = useState(0.1);
  const [textRot, setTextRot] = useState(0);

  const [image, setImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState(0.3);
  const [imgPosX, setImgPosX] = useState(0);
  const [imgPosY, setImgPosY] = useState(0.3);
  const [imgRot, setImgRot] = useState(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-[400px] h-full bg-white shadow-2xl z-10 overflow-y-auto p-6 scrollbar-hide">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-6 font-medium text-sm"
        >
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Customizer</h1>
          <p className="text-gray-500 text-sm">
            Design your custom {id || "product"}
          </p>
        </header>

        {/* Color Picker */}
        <ControlGroup title="Base Color" icon={Palette}>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-12 rounded-lg cursor-pointer border-none p-0"
            />
            <span className="text-sm font-mono text-gray-600 uppercase">
              {color}
            </span>
          </div>
        </ControlGroup>

        {/* Text Controls */}
        <ControlGroup title="Text Customization" icon={Type}>
          <input
            type="text"
            placeholder="Type something..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
          />

          <div className="flex items-center gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-400 uppercase font-bold">
                Text Color
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-none p-0"
              />
            </div>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="flex-1 p-2 rounded-lg border border-gray-200 text-sm mt-4"
            >
              <option value="sans-serif">Sans Serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
              <option value="cursive">Cursive</option>
            </select>
          </div>

          <Slider
            label="Scale"
            value={textSize}
            min={0.1}
            max={1.5}
            onChange={setTextSize}
          />
          <div className="grid grid-cols-2 gap-4">
            <Slider
              label="Pos X"
              value={textPosX}
              min={-1.5}
              max={1.5}
              onChange={setTextPosX}
            />
            <Slider
              label="Pos Y"
              value={textPosY}
              min={-1.5}
              max={1.5}
              onChange={setTextPosY}
            />
          </div>
          <Slider
            label="Rotation"
            value={textRot}
            min={-Math.PI}
            max={Math.PI}
            onChange={setTextRot}
          />
        </ControlGroup>

        {/* Image Controls */}
        <ControlGroup title="Logo / Image" icon={Upload}>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="text-gray-400 mb-2" size={24} />
              <p className="text-xs text-gray-500">Click to upload PNG/JPG</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>

          {image && (
            <>
              <Slider
                label="Scale"
                value={imageSize}
                min={0.1}
                max={1.2}
                onChange={setImageSize}
              />
              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="Pos X"
                  value={imgPosX}
                  min={-1.5}
                  max={1.5}
                  onChange={setImgPosX}
                />
                <Slider
                  label="Pos Y"
                  value={imgPosY}
                  min={-1.5}
                  max={1.5}
                  onChange={setImgPosY}
                />
              </div>
              <Slider
                label="Rotation"
                value={imgRot}
                min={-Math.PI}
                max={Math.PI}
                onChange={setImgRot}
              />
            </>
          )}
        </ControlGroup>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-neutral-100">
        <Canvas shadows camera={{ position: [0, 0, 5.5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            shadow-mapSize={1024}
            castShadow
          />
          <Environment preset="city" />

          <Suspense
            fallback={
              <Html center className="text-gray-400 font-medium">
                Loading 3D Model...
              </Html>
            }
          >
            <Center>
              {(() => {
                const props = {
                  color,
                  decalConfig: {
                    text,
                    fontSize,
                    fontFamily,
                    textColor,
                    textSize,
                    textPosX,
                    textPosY,
                    textRot,
                    image,
                    imageSize,
                    imgPosX,
                    imgPosY,
                    imgRot,
                  },
                };

                switch (id) {
                  case "cap":
                    return <Cap {...props} />;
                  case "tumbler":
                    return <Tumbler {...props} />;
                  case "paper-bag":
                    return <PaperBag {...props} />;
                  case "t-shirt":
                    return <TShirt {...props} />;
                  case "shopping-bag":
                    return <ShoppingBag {...props} />;
                  default:
                    return <Cap {...props} />;
                }
              })()}
            </Center>
            <ContactShadows
              position={[0, -1.2, 0]}
              opacity={0.4}
              scale={10}
              blur={2.5}
              far={1}
            />
          </Suspense>

          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
}
