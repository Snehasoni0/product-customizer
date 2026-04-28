"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

export default function PaperBag({
  color,
  decalConfig = {},
}: {
  color: string;
  decalConfig: any;
}) {
  const { scene } = useGLTF("/paper_bag.glb") as any;
  
  // 1. Clone and clean the scene
  const cleanedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((n: any) => {
      if (n.isMesh) {
        const name = n.name.toLowerCase();
        if (name.includes("shadow") || name.includes("plane") || name.includes("ground") || name.includes("floor")) {
          n.visible = false;
          n.scale.set(0,0,0);
        }
      }
    });
    return clone;
  }, [scene]);

  // 2. Identify the Body Mesh
  const bodyMesh = useMemo(() => {
    let largest = null;
    let maxCount = 0;
    cleanedScene.traverse((n: any) => {
      if (n.isMesh && n.visible) {
        const count = n.geometry.attributes.position.count;
        if (count > maxCount) {
          maxCount = count;
          largest = n;
        }
      }
    });
    return largest;
  }, [cleanedScene]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasTexture, setCanvasTexture] = useState<THREE.CanvasTexture | null>(null);

  // 3. Initialize Canvas Texture
  useEffect(() => {
    if (typeof document !== "undefined" && !canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      canvasRef.current = canvas;
      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = true; 
      texture.anisotropy = 16;
      texture.colorSpace = THREE.SRGBColorSpace; 
      setCanvasTexture(texture);
    }
  }, []);

  // 4. Draw Logic (With Rotation & Mirror Fix for Paper Bag)
  useEffect(() => {
    if (!canvasTexture || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderCanvas = async () => {
      ctx.fillStyle = color || "#ffffff";
      ctx.fillRect(0, 0, 1024, 1024);

      // --- PAPER BAG UV FIX ---
      // The UVs on this model seem rotated 90 degrees and mirrored.
      // We compensate here.
      ctx.save();
      
      // Image
      if (decalConfig.image) {
        try {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const i = new Image();
            i.crossOrigin = "anonymous"; 
            i.onload = () => resolve(i);
            i.onerror = (err) => reject(err);
            i.src = decalConfig.image;
          });
          
          // Move to center, rotate, and flip to match paper bag UVs
          const x = 512 + (Number(decalConfig.imgPosX) * 256); 
          const y = 512 - (Number(decalConfig.imgPosY) * 256);
          const w = 200 * Number(decalConfig.imageSize) * 2;

          ctx.save();
          ctx.translate(x, y);
          // Combine UV rotation (90 deg) with user rotation
          ctx.rotate(Number(decalConfig.imgRot) - Math.PI / 2); 
          // Mirror flip if needed (based on user feedback characters were backwards)
          ctx.scale(-1, 1); 
          ctx.drawImage(img, -w / 2, -w / 2, w, w);
          ctx.restore();
        } catch (e) {}
      }

      // Text
      if (decalConfig.text) {
        const x = 512 + (Number(decalConfig.textPosX) * 256);
        const y = 512 - (Number(decalConfig.textPosY) * 256);
        const fontSize = 100 * Number(decalConfig.textSize);

        ctx.save();
        ctx.translate(x, y);
        // Correct 90 degree rotation and mirroring
        ctx.rotate(Number(decalConfig.textRot) - Math.PI / 2);
        ctx.scale(-1, 1); 
        
        ctx.fillStyle = decalConfig.textColor || "#ffffff"; 
        ctx.font = `bold ${fontSize}px ${decalConfig.fontFamily || "Arial"}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(decalConfig.text, 0, 0);
        ctx.restore();
      }
      
      ctx.restore();
      canvasTexture.needsUpdate = true;
    };
    renderCanvas();
  }, [decalConfig, color, canvasTexture]);

  // 5. Apply to Model
  useEffect(() => {
    if (!canvasTexture || !bodyMesh) return;
    cleanedScene.traverse((n: any) => {
      if (n.isMesh) {
        if (!n.userData.isCustomized) {
          n.material = n.material.clone();
          n.userData.isCustomized = true;
        }
        if (n === bodyMesh) {
          n.material.color.set("#ffffff"); 
          n.material.map = canvasTexture;
        } else {
          n.material.color.set(color);
          n.material.map = null;
        }
        n.material.needsUpdate = true;
      }
    });
  }, [cleanedScene, color, bodyMesh, canvasTexture]);

  return (
    <group scale={0.05}> 
      <Center>
        <primitive object={cleanedScene} />
      </Center>
    </group>
  );
}

useGLTF.preload("/paper_bag.glb");
