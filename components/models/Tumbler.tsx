"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export default function Tumbler({
  color,
  decalConfig,
  selectedItem,
  setSelectedItem,
  handleUpdateDecal,
}: {
  color: string;
  decalConfig: any;
  selectedItem: string | null;
  setSelectedItem: (item: string | null) => void;
  handleUpdateDecal: (updates: any) => void;
}) {
  const { scene } = useGLTF("/hydro_flask_tumbler.glb") as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { controls } = useThree() as any;
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasTexture, setCanvasTexture] = useState<THREE.CanvasTexture | null>(null);

  const p = (val: any, def = 0) => (val !== undefined ? val : def);

  useEffect(() => {
    if (typeof document !== "undefined" && !canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 1024;
      canvasRef.current = canvas;
      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = true; 
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.anisotropy = 16;
      texture.colorSpace = THREE.SRGBColorSpace;
      setCanvasTexture(texture);
    }
  }, []);

  const bodyMesh = useMemo(() => {
    let mainBody: any = null;
    let maxArea = 0;
    clonedScene.traverse((n: any) => {
      if (n.isMesh) {
        n.geometry.computeBoundingBox();
        const size = new THREE.Vector3();
        n.geometry.boundingBox!.getSize(size);
        const area = size.x * size.y;
        if (area > maxArea) { maxArea = area; mainBody = n; }
      }
    });
    return mainBody;
  }, [clonedScene]);

  useEffect(() => {
    if (!canvasTexture || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderCanvas = async () => {
      ctx.fillStyle = color || "#ffffff";
      ctx.fillRect(0, 0, 2048, 1024);

      if (decalConfig.image) {
        try {
          const img = await new Promise<HTMLImageElement>((res) => {
            const i = new Image();
            i.crossOrigin = "anonymous";
            i.onload = () => res(i);
            i.src = decalConfig.image;
          });
          const aspect = img.width / img.height;
          const size = p(decalConfig.imageSize, 0.2) * 800;
          const x = p(decalConfig.imgPosX, 0.5) * 2048;
          const y = (1 - p(decalConfig.imgPosY, 0.5)) * 1024;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((decalConfig.imgRot || 0) * (Math.PI / 180));
          ctx.drawImage(img, -(size * aspect) / 2, -size / 2, size * aspect, size);
          if (selectedItem === "image") {
            ctx.strokeStyle = "white"; ctx.setLineDash([20, 20]); ctx.lineWidth = 10;
            ctx.strokeRect(-(size * aspect) / 2 - 20, -size / 2 - 20, size * aspect + 40, size + 40);
          }
          ctx.restore();
        } catch (e) {}
      }

      if (decalConfig.text) {
        const fontSize = p(decalConfig.textSize, 0.2) * 400;
        ctx.font = `bold ${fontSize}px ${decalConfig.fontFamily || "Arial"}`;
        const metrics = ctx.measureText(decalConfig.text);
        const x = p(decalConfig.textPosX, 0.5) * 2048;
        const y = (1 - p(decalConfig.textPosY, 0.5)) * 1024;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((decalConfig.textRot || 0) * (Math.PI / 180));
        ctx.fillStyle = decalConfig.textColor || "#ffffff";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(decalConfig.text, 0, 0);
        if (selectedItem === "text") {
          ctx.strokeStyle = "white"; ctx.setLineDash([20, 20]); ctx.lineWidth = 10;
          ctx.strokeRect(-(metrics.width + 60) / 2, -(fontSize + 60) / 2, metrics.width + 60, fontSize + 60);
        }
        ctx.restore();
      }
      canvasTexture.needsUpdate = true;
    };
    renderCanvas();
  }, [decalConfig, color, canvasTexture, selectedItem]);

  useEffect(() => {
    if (!bodyMesh || !canvasTexture) return;
    clonedScene.traverse((n: any) => {
      if (n.isMesh) {
        const newMat = new THREE.MeshStandardMaterial({
          roughness: 0.3,
          metalness: 0.1,
        });
        if (n === bodyMesh) { 
          newMat.map = canvasTexture; 
          newMat.color.set("#ffffff"); 
        } else { 
          newMat.color.set("#222222"); 
          newMat.map = null; 
        }
        n.material = newMat;
        n.material.needsUpdate = true;
      }
    });
  }, [clonedScene, bodyMesh, canvasTexture, color]);

  const handlePointerDown = (e: any) => {
    if (!e.uv) return;
    const { x, y } = e.uv;

    // Check distance to text
    const distText = Math.sqrt(Math.pow(x - (decalConfig.textPosX || 0.5), 2) + Math.pow(y - (decalConfig.textPosY || 0.5), 2));
    const textThreshold = (decalConfig.textSize || 0.2) * 0.5;

    // Check distance to logo
    const distImg = Math.sqrt(Math.pow(x - (decalConfig.imgPosX || 0.5), 2) + Math.pow(y - (decalConfig.imgPosY || 0.5), 2));
    const imgThreshold = (decalConfig.imageSize || 0.2) * 0.5;

    if (distText < textThreshold) {
      e.stopPropagation();
      setSelectedItem("text");
      setIsDragging(true);
      if (controls) controls.enabled = false;
    } else if (distImg < imgThreshold) {
      e.stopPropagation();
      setSelectedItem("image");
      setIsDragging(true);
      if (controls) controls.enabled = false;
    } else {
      // Rotation handled by bubbling
    }
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || !selectedItem || !e.uv) return;
    e.stopPropagation();
    const { x, y } = e.uv;
    // Map UVs back to normalized state coordinates
    if (selectedItem === "text") handleUpdateDecal({ textPosX: x, textPosY: y });
    else handleUpdateDecal({ imgPosX: x, imgPosY: y });
  };

  useEffect(() => {
    const up = () => { setIsDragging(false); if (controls) controls.enabled = true; };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [controls]);

  return (
    <group scale={0.15} position={[0, -2.5, 0]}>
      <primitive object={clonedScene} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} />
    </group>
  );
}

useGLTF.preload("/hydro_flask_tumbler.glb");