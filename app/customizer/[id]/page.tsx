"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Stage } from "@react-three/drei";
import { useParams } from "next/navigation";
import { Upload, Type, Palette, ArrowLeft, RotateCw, Move } from "lucide-react";
import Link from "next/link";

// Model Components
import Cap from "@/components/models/Cap";
import Tumbler from "@/components/models/Tumbler";

import TShirt from "@/components/models/TShirt";
import ShoppingBag from "@/components/models/ShoppingBag";

// ------------------ UI HELPERS ------------------

const getModelName = (id: any) => {
  switch (id) {
    case "cap":
      return "Elite Baseball Cap";
    case "tumbler":
      return "Premium Tumbler";
    case "t-shirt":
      return "Essential T-Shirt";
    case "shopping-bag":
      return "Canvas Tote Bag";
    default:
      return "Product";
  }
};

const ControlGroup = ({ title, icon: Icon, children }: any) => (
  <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
    <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
      <Icon size={18} />
      <span>{title}</span>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Slider = ({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  displayMultiplier = 100,
  suffix = "%",
}: any) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-500 uppercase font-medium">
        <label>{label}</label>
        <span className="font-mono">
          {Math.round(value * displayMultiplier)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          e.stopPropagation();
          onChange(parseFloat(e.target.value));
        }}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
      />
    </div>
  );
};

// ------------------ MAIN PAGE ------------------

export default function CustomizerPage() {
  const { id } = useParams();
  const [color, setColor] = useState("#FFFFFF");
  const [text, setText] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [modelRotation, setModelRotation] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [controlsEnabled, setControlsEnabled] = useState(true);

  // STABLE FLOAT STATES (0.0 to 1.0)
  const [textSize, setTextSize] = useState(0.2);
  const [textPosX, setTextPosX] = useState(0);
  const [textPosY, setTextPosY] = useState(0.5);
  const [textRot, setTextRot] = useState(0);
  const [textColor, setTextColor] = useState("#000000");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [textNormal, setTextNormal] = useState<number[]>([0, 0, 1]);

  const [image, setImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState(0.06);
  const [imgPosX, setImgPosX] = useState(0);
  const [imgPosY, setImgPosY] = useState(0.5);
  const [imgRot, setImgRot] = useState(Math.PI);
  const [imgNormal, setImgNormal] = useState<number[]>([0, 0, -1]);

  const [backImage, setBackImage] = useState<string | null>(null);
  const [backImageSize, setBackImageSize] = useState(2.2);
  const [backImgPosY, setBackImgPosY] = useState(0.1);

  useEffect(() => {
    if (id === "cap") {
      setText("ELITE");
      setTextSize(0.08);
      setTextPosX(0);
      setTextPosY(0.55);
      setTextNormal([0, 0, 1]);
      setImageSize(0.06);
      setImgPosX(0);
      setImgPosY(0.565);
      setImgRot(0);
      setImgNormal([0, 0, -1]);
    } else if (id === "tumbler") {
      setText("TUMBLER");
      setTextSize(0.2);
      setTextPosX(0.43);
      setTextPosY(0.41);
      setImageSize(0.19);
      setImgPosX(0.43);
      setImgPosY(0.22);
      setImgRot(0);
    } else if (id === "t-shirt") {
      setText("DESIGN");
      setTextSize(0.5);
      setTextPosX(0.69);
      setTextPosY(-0.34);
      setTextRot(0.07);
      setImageSize(0.3);
      setImgPosX(-1.0);
      setImgPosY(-0.3);
      setImgRot(0.31);
    } else if (id === "shopping-bag") {
      setText("DESIGN");
      setTextSize(0.25);
      setTextPosX(0);
      setTextPosY(0);
      setTextRot(0);
      setImageSize(0.36);
      setImgPosX(0);
      setImgPosY(-0.39);
      setImgRot(0);
    } else if (id === "shopping-bag") {
      setTextPosY(0.0);
      setImgPosY(0.0);
    }
  }, [id]);

  useEffect(() => {
    if (id === "cap" || id === "t-shirt") {
      if (selectedItem === "image") setModelRotation([0, Math.PI, 0]);
      else setModelRotation([0, 0, 0]);
    } else if (id === "tumbler") {
      if (selectedItem === "image") setModelRotation([0, -Math.PI / 2, 0]);
      else setModelRotation([0, -Math.PI / 2, 0]); // Tumbler is usually side-view
    } else if (id === "shopping-bag") {
      // Don't force front rotation here so back image view stays active
    }
  }, [id, selectedItem]);

  const handleUpdateDecal = (updates: any) => {
    if (updates.textPosX !== undefined) setTextPosX(updates.textPosX);
    if (updates.textPosY !== undefined) setTextPosY(updates.textPosY);
    if (updates.textSize !== undefined) setTextSize(updates.textSize);
    if (updates.textNormal !== undefined) setTextNormal(updates.textNormal);
    if (updates.textRot !== undefined) setTextRot(updates.textRot);

    if (updates.imgPosX !== undefined) setImgPosX(updates.imgPosX);
    if (updates.imgPosY !== undefined) setImgPosY(updates.imgPosY);
    if (updates.imageSize !== undefined) setImageSize(updates.imageSize);
    if (updates.imgNormal !== undefined) setImgNormal(updates.imgNormal);
    if (updates.imgRot !== undefined) setImgRot(updates.imgRot);
  };

  const handleBackImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBackImage(reader.result as string);
        setModelRotation([0, Math.PI, 0]); // Auto-rotate to show back design
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setSelectedItem("image");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-200 overflow-hidden font-sans">
      <div
        className="w-full md:w-[400px] h-full bg-white shadow-2xl z-10 overflow-y-auto p-6 scrollbar-hide"
        onMouseEnter={() => setControlsEnabled(false)}
        onMouseLeave={() => setControlsEnabled(true)}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-6 font-medium text-sm"
        >
          <ArrowLeft size={16} /> Back to Products
        </Link>

        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Customizer</h1>
          <p className="text-gray-500 text-sm">
            Design your custom {id || "product"}
          </p>
        </header>

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

        <ControlGroup title="Design Elements" icon={Type}>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedItem("text")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${selectedItem === "text" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}
            >
              Text
            </button>
            <button
              onClick={() => setSelectedItem("image")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${selectedItem === "image" ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}
            >
              Logo
            </button>
          </div>

          {!selectedItem ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 animate-in fade-in zoom-in duration-300">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                <Move className="text-gray-400" size={20} />
              </div>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Customize your model by<br />adding text and logo
              </p>
            </div>
          ) : selectedItem === "text" ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                placeholder="Type text..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 outline-none"
              />
              <div className="flex gap-4">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded border-none p-0"
                />
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-gray-200 text-sm"
                >
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
              <Slider
                label="Text Scale"
                value={textSize}
                min={0.01}
                max={2.0}
                onChange={setTextSize}
              />
              <Slider
                label={
                  id === "hydro-flask" || id === "tumbler"
                    ? "Horizontal Position (360°)"
                    : "Text Pos X"
                }
                value={textPosX}
                min={id === "hydro-flask" || id === "tumbler" ? 0 : -0.5}
                max={id === "hydro-flask" || id === "tumbler" ? 1 : 0.5}
                displayMultiplier={
                  id === "hydro-flask" || id === "tumbler" ? 360 : 1
                }
                suffix={id === "hydro-flask" || id === "tumbler" ? "°" : ""}
                onChange={setTextPosX}
              />
              <Slider
                label="Text Pos Y"
                value={textPosY}
                min={id === "hydro-flask" || id === "tumbler" ? 0 : -0.7}
                max={id === "hydro-flask" || id === "tumbler" ? 1 : 0.4}
                displayMultiplier={1}
                onChange={setTextPosY}
              />

              <Slider
                label="Text Rotation"
                value={textRot}
                min={0}
                max={Math.PI * 2}
                displayMultiplier={180 / Math.PI}
                suffix="°"
                onChange={setTextRot}
              />
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <Upload className="text-gray-400 mb-1" size={20} />
                <span className="text-[10px] text-gray-500 uppercase font-bold">
                  Upload Logo
                </span>
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
                    label="Logo Scale"
                    value={imageSize}
                    min={0.01}
                    max={2.0}
                    onChange={setImageSize}
                  />
                  <Slider
                    label="Logo Pos X"
                    value={imgPosX}
                    min={-5}
                    max={5}
                    displayMultiplier={1}
                    onChange={setImgPosX}
                  />
                  <Slider
                    label="Logo Pos Y"
                    value={imgPosY}
                    min={-5}
                    max={5}
                    displayMultiplier={1}
                    onChange={setImgPosY}
                  />

                  <Slider
                    label="Logo Rotation"
                    value={imgRot}
                    min={0}
                    max={Math.PI * 2}
                    displayMultiplier={180 / Math.PI}
                    suffix="°"
                    onChange={setImgRot}
                  />
                </>
              )}
            </div>
          )}
        </ControlGroup>

        {id !== "cap" && id !== "tumbler" && id !== "t-shirt" && id !== "shopping-bag" && (
          <ControlGroup title="Back Side Design" icon={Move}>
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <Upload className="text-gray-400 mb-1" size={20} />
                <span className="text-[10px] text-gray-500 uppercase font-bold">
                  Upload Back Cover
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleBackImageUpload}
                />
              </label>
              {backImage && (
                <>
                  <Slider
                    label="Back Cover Scale"
                    value={backImageSize}
                    min={0.5}
                    max={5.0}
                    onChange={setBackImageSize}
                  />
                  <Slider
                    label="Back Cover Y Position"
                    value={backImgPosY}
                    min={-2.0}
                    max={2.0}
                    displayMultiplier={1}
                    onChange={setBackImgPosY}
                  />
                </>
              )}
            </div>
          </ControlGroup>
        )}
        
        {/* Shopping Bag has its own version of Back Side Design without sliders */}
        {id === "shopping-bag" && (
          <ControlGroup title="Back Side Design" icon={Move}>
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                <Upload className="text-gray-400 mb-1" size={20} />
                <span className="text-[10px] text-gray-500 uppercase font-bold">
                  Upload Back Cover
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleBackImageUpload}
                />
              </label>
            </div>
          </ControlGroup>
        )}

        {/* Model View removed as requested for a cleaner automated experience */}
      </div>

      <div className="flex-1 relative bg-neutral-100">
        <Canvas
          shadows
          camera={{ position: [0, 0, 150], fov: 40 }}
          onPointerMissed={() => setSelectedItem(null)}
        >
          <ambientLight intensity={0.5} />
          <Environment preset="city" />
          <Suspense
            fallback={
              <Html center className="text-gray-400 font-medium">
                Loading {getModelName(id)}...
              </Html>
            }
          >
            <Stage
              adjustCamera={1.2}
              intensity={0.5}
              environment="city"
              preset="rembrandt"
              shadows="contact"
            >
              <group>
                {(() => {
                  const props = {
                    color,
                    selectedItem,
                    setSelectedItem,
                    handleUpdateDecal,
                    decalConfig: {
                      text,
                      textColor,
                      textSize,
                      textPosX,
                      textPosY,
                      textRot,
                      fontFamily,
                      textNormal,
                      image,
                      imageSize,
                      imgPosX,
                      imgPosY,
                      imgRot,
                      imgNormal,
                      modelRotation,
                      backImage,
                      backImageSize,
                      backImgPosY,
                    },
                  };
                  switch (id) {
                    case "cap":
                      return <Cap {...props} />;
                    case "tumbler":
                      return <Tumbler {...props} />;

                    case "t-shirt":
                      return <TShirt {...props} />;
                    case "shopping-bag":
                      return <ShoppingBag {...props} />;
                    default:
                      return <Cap {...props} />;
                  }
                })()}
              </group>
            </Stage>
          </Suspense>
          <OrbitControls
            makeDefault
            enablePan={false}
            enabled={controlsEnabled}
          />
        </Canvas>
      </div>
    </div>
  );
}
