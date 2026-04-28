"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Tumbler({
  color,
  decalConfig = {},
}: {
  color: string;
  decalConfig: any;
}) {
  const { scene } = useGLTF("/hydro_flask_tumbler.glb") as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasTexture, setCanvasTexture] = useState<THREE.CanvasTexture | null>(null);

  // 1. Initialize Canvas Texture (Higher Resolution for full width)
  useEffect(() => {
    if (typeof document !== "undefined" && !canvasRef.current) {
      const canvas = document.createElement("canvas");
      // Use 2048 for more horizontal space and sharper text
      canvas.width = 2048;
      canvas.height = 1024;
      canvasRef.current = canvas;
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = true; 
      // Wrap horizontally to prevent cutting off at the edges
      texture.wrapS = THREE.RepeatWrapping;
      texture.anisotropy = 16;
      texture.colorSpace = THREE.SRGBColorSpace; 
      
      setCanvasTexture(texture);
    }
  }, []);

  // 2. Identify the Body Mesh
  const bodyMesh = useMemo(() => {
    let mainBody: any = null;
    let maxScore = 0;

    clonedScene.traverse((n: any) => {
      if (n.isMesh) {
        const meshName = n.name.toLowerCase();
        n.geometry.computeBoundingBox();
        const box = n.geometry.boundingBox!;
        const size = new THREE.Vector3();
        box.getSize(size);
        
        const volume = size.x * size.y * size.z;
        const height = size.y;
        let score = volume * height; 

        if (meshName.includes("lid") || meshName.includes("cap") || meshName.includes("rim") || meshName.includes("top") || meshName.includes("straw")) {
          score *= 0.01; 
        }

        if (score > maxScore) {
          maxScore = score;
          mainBody = n;
        }
      }
    });

    return mainBody;
  }, [clonedScene]);

  // 3. Draw Logic
  useEffect(() => {
    if (!canvasTexture || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderCanvas = async () => {
      // Fill background
      ctx.fillStyle = color || "#2196f3";
      ctx.fillRect(0, 0, 2048, 1024);

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

          const iPosX = Number(decalConfig.imgPosX) || 0;
          const iPosY = Number(decalConfig.imgPosY) || 0;
          const iSize = Number(decalConfig.imageSize) || 1;
          const iRot = Number(decalConfig.imgRot) || 0;

          // Map to 2048 width: center is 1024
          const x = 1024 + (iPosX * 682); 
          const y = 512 - (iPosY * 341);
          const w = 400 * iSize;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(iRot);
          ctx.drawImage(img, -w / 2, -w / 2, w, w);
          ctx.restore();
        } catch (error) {
          console.error("Image load error:", error);
        }
      }

      // Text
      if (decalConfig.text) {
        const tPosX = Number(decalConfig.textPosX) || 0;
        const tPosY = Number(decalConfig.textPosY) || 0;
        const tSize = Number(decalConfig.textSize) || 1;
        const tRot = Number(decalConfig.textRot) || 0;

        const x = 1024 + (tPosX * 682);
        const y = 512 - (tPosY * 341);
        const fontSize = 150 * tSize; // Slightly larger base font for 2048 width

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tRot);
        ctx.fillStyle = decalConfig.textColor || "#ffffff"; 
        ctx.font = `bold ${fontSize}px ${decalConfig.fontFamily || "Arial"}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(decalConfig.text, 0, 0);
        ctx.restore();
      }

      canvasTexture.needsUpdate = true;
    };

    renderCanvas();
  }, [decalConfig, color, canvasTexture]);

  // 4. Apply to Model
  useEffect(() => {
    if (!canvasTexture || !bodyMesh) return;

    clonedScene.traverse((n: any) => {
      if (n.isMesh) {
        if (!n.userData.isCustomized) {
          n.material = n.material.clone();
          n.userData.isCustomized = true;
        }

        if (n === bodyMesh) {
          n.material.color.set("#ffffff"); 
          n.material.map = canvasTexture;
          // Ensure texture repeats horizontally to cover full width
          if (n.material.map) {
            n.material.map.wrapS = THREE.RepeatWrapping;
            n.material.map.needsUpdate = true;
          }
        } else {
          n.material.color.set(color);
          n.material.map = null;
        }

        n.material.roughness = 0.3;
        n.material.metalness = 0.1;
        n.material.needsUpdate = true;
      }
    });
  }, [clonedScene, color, bodyMesh, canvasTexture]);

  if (!canvasTexture) return null;

  return (
    <group scale={0.15} position={[0, -2.5, 0]}> 
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/hydro_flask_tumbler.glb");