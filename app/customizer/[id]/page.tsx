"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, Stage } from "@react-three/drei";
import { useParams } from "next/navigation";
import { Upload, Type, Palette, ArrowLeft, RotateCw, Move, Download, Box } from "lucide-react";
import Link from "next/link";

// Model Components
import Cap from "@/components/models/Cap";
import Tumbler from "@/components/models/Tumbler";

import TShirt from "@/components/models/TShirt";
import ShoppingBag from "@/components/models/ShoppingBag";
import ModelSkeleton from "@/components/ModelSkeleton";


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
  <div className="mb-6 p-5 bg-white/5 backdrop-blur-xl rounded-[28px] border border-white/10 shadow-2xl relative overflow-hidden group">
    {/* Subtle gradient glow */}
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-all duration-700" />
    
    <div className="flex items-center gap-2 mb-5 text-gray-200 font-bold text-xs uppercase tracking-[0.15em] relative z-10">
      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
        <Icon size={14} className="text-gray-400" />
      </div>
      <span>{title}</span>
    </div>
    <div className="space-y-5 relative z-10">{children}</div>
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
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold tracking-widest">
        <label>{label}</label>
        <span className="font-mono text-white/60">
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
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white hover:accent-gray-200 transition-all"
      />
    </div>
  );
};

// ------------------ MAIN PAGE ------------------

export default function CustomizerPage() {
  const { id } = useParams();
  const sceneRef = useRef<THREE.Group>(null);
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
  const [fontFamily, setFontFamily] = useState("Outfit");
  const weight = fontFamily === "Playwrite BR" ? "normal" : "bold";
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

  const handleDownload = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    // Create a temporary link to download the image
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `custom-design-${id}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportModel = () => {
    if (!sceneRef.current) return;

    const exporter = new GLTFExporter();
    exporter.parse(
      sceneRef.current,
      (result) => {
        const output = result instanceof ArrayBuffer ? result : JSON.stringify(result);
        const blob = new Blob([output], { type: "application/octet-stream" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `custom-model-${id}-${Date.now()}.glb`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      (error) => {
        console.error("An error happened during GLTF export:", error);
      },
      { binary: true }
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050505] overflow-hidden font-sans selection:bg-white selection:text-black">
      <div
        className="w-full md:w-[400px] h-full bg-[#0a0a0a] border-r border-white/5 shadow-2xl z-10 overflow-y-auto p-8 scrollbar-hide"
        onMouseEnter={() => setControlsEnabled(false)}
        onMouseLeave={() => setControlsEnabled(true)}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-all mb-12 font-bold text-[10px] uppercase tracking-[0.3em]"
        >
          <ArrowLeft size={12} /> Back to Products
        </Link>

        {/* Font Pre-loader (Hidden) */}
        <div className="sr-only opacity-0 pointer-events-none absolute -z-50">
          <span style={{ fontFamily: "Outfit" }}>Preload</span>
          <span style={{ fontFamily: "Playwrite BR" }}>Preload</span>
          <span style={{ fontFamily: "Roboto" }}>Preload</span>
          <span style={{ fontFamily: "Inter" }}>Preload</span>
          <span style={{ fontFamily: "Playfair Display" }}>Preload</span>
          <span style={{ fontFamily: "Montserrat" }}>Preload</span>
          <span style={{ fontFamily: "Bebas Neue" }}>Preload</span>
          <span style={{ fontFamily: "Space Mono" }}>Preload</span>
        </div>


        <ControlGroup title="Base Color" icon={Palette}>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-12 rounded-xl cursor-pointer border border-white/10 p-0 bg-transparent"
            />
            <span className="text-sm font-mono text-gray-400 uppercase tracking-widest">
              {color}
            </span>
          </div>
        </ControlGroup>

        <ControlGroup title="Design Elements" icon={Type}>
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/5">
            <button
              onClick={() => setSelectedItem("text")}
              className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedItem === "text" ? "bg-white text-black shadow-xl" : "text-gray-500 hover:text-gray-300"}`}
            >
              Text
            </button>
            <button
              onClick={() => setSelectedItem("image")}
              className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedItem === "image" ? "bg-white text-black shadow-xl" : "text-gray-500 hover:text-gray-300"}`}
            >
              Logo
            </button>
          </div>

          {!selectedItem ? (
            <div className="flex flex-col items-center justify-center py-14 px-4 text-center bg-white/[0.02] rounded-3xl border border-dashed border-white/10 animate-in fade-in zoom-in duration-700">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-5 border border-white/5">
                <Move className="text-gray-600" size={28} />
              </div>
              <p className="text-gray-500 text-xs font-bold tracking-tight leading-relaxed uppercase opacity-80">
                Select element to<br /><span className="text-white">customize</span>
              </p>
            </div>
          ) : selectedItem === "text" ? (
            <div className="space-y-7 animate-in fade-in slide-in-from-top-6 duration-500">
              <input
                type="text"
                placeholder="Type here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder:text-gray-600 outline-none focus:border-white/30 transition-all text-sm font-medium"
              />
              <div className="flex gap-4">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-12 rounded-xl border border-white/10 p-0 bg-transparent cursor-pointer"
                />
                <div className="flex-1 relative">
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full p-3 bg-white/5 rounded-2xl border border-white/10 text-white text-[11px] font-bold uppercase tracking-widest appearance-none cursor-pointer outline-none focus:border-white/30 transition-all pr-8"
                  >
                    <option value="Outfit">Outfit</option>
                    <option value="Playwrite BR">Playwrite BR</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="sans-serif">Sans Serif</option>
                    <option value="cursive">Cursive</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <RotateCw size={12} className="rotate-90" />
                  </div>
                </div>
              </div>
              <Slider
                label="Scale"
                value={textSize}
                min={0.01}
                max={2.0}
                onChange={setTextSize}
              />
              <Slider
                label="Rotation"
                value={textRot}
                min={0}
                max={Math.PI * 2}
                displayMultiplier={180 / Math.PI}
                suffix="°"
                onChange={setTextRot}
              />
            </div>
          ) : (
            <div className="space-y-7 animate-in fade-in slide-in-from-top-6 duration-500">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/[0.03] hover:border-white/30 transition-all group">
                <Upload className="text-gray-600 mb-2 group-hover:text-white transition-colors" size={32} />
                <span className="text-[9px] text-gray-500 group-hover:text-gray-300 uppercase font-bold tracking-[0.25em]">
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
                    label="Scale"
                    value={imageSize}
                    min={0.01}
                    max={2.0}
                    onChange={setImageSize}
                  />

                  <Slider
                    label="Rotation"
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
          <ControlGroup title="Back Side" icon={Move}>
            <div className="space-y-7">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/[0.03] hover:border-white/30 transition-all group">
                <Upload className="text-gray-600 mb-2 group-hover:text-white transition-colors" size={32} />
                <span className="text-[9px] text-gray-500 group-hover:text-gray-300 uppercase font-bold tracking-[0.25em]">
                  Upload Cover
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
          <ControlGroup title="Back Side" icon={Move}>
            <div className="space-y-7">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-white/[0.03] hover:border-white/30 transition-all group">
                <Upload className="text-gray-600 mb-2 group-hover:text-white transition-colors" size={32} />
                <span className="text-[9px] text-gray-500 group-hover:text-gray-300 uppercase font-bold tracking-[0.25em]">
                  Upload Cover
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
        
        {/* Download Actions */}
        <div className="space-y-3 mt-8">
          <button
            onClick={handleDownload}
            className="w-full py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 active:scale-95 transition-all group"
          >
            <Download size={18} className="text-gray-400 group-hover:text-white transition-colors" />
            Save Screenshot
          </button>
          
          <button
            onClick={handleExportModel}
            className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 active:scale-95 transition-all shadow-xl shadow-black/20 group"
          >
            <Box size={18} className="group-hover:rotate-12 transition-transform" />
            Download 3D Model (.glb)
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-[#f3f4f6]">
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [0, 0, 150], fov: 40 }}
          onPointerMissed={() => setSelectedItem(null)}
        >
          <ambientLight intensity={0.5} />
          <Environment preset="city" />
          <Suspense
            fallback={<ModelSkeleton modelName={getModelName(id)} />}
          >
            <Stage
              adjustCamera={1.2}
              intensity={0.5}
              environment="city"
              preset="rembrandt"
              shadows="contact"
            >
              <group ref={sceneRef}>
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
