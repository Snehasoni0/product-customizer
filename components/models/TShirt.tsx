"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function TShirt({
  color,
  decalConfig = {},
}: {
  color: string;
  decalConfig: any;
}) {
  const { scene } = useGLTF("/plain_dark_blue_t-shirt.glb") as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasTexture, setCanvasTexture] = useState<THREE.CanvasTexture | null>(null);

  // 1. Initialize Canvas Texture
  useEffect(() => {
    if (typeof document !== "undefined" && !canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 2048; // T-shirts often need square high-res UVs
      canvasRef.current = canvas;
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = true; 
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

        // T-shirt body is usually named "T_Shirt" or similar
        if (meshName.includes("shirt") || meshName.includes("body") || meshName.includes("fabric")) {
          score *= 10;
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
      ctx.fillStyle = color || "#ffffff";
      ctx.fillRect(0, 0, 2048, 2048);

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

          // Standard mapping for center of T-shirt UVs (usually around the middle)
          const x = 1024 + (iPosX * 512); 
          const y = 1024 - (iPosY * 512);
          const w = 400 * iSize * 2;

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

        const x = 1024 + (tPosX * 512);
        const y = 1024 - (tPosY * 512);
        const fontSize = 150 * tSize;

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
        } else {
          n.material.color.set(color);
          n.material.map = null;
        }

        n.material.needsUpdate = true;
      }
    });
  }, [clonedScene, color, bodyMesh, canvasTexture]);

  if (!canvasTexture) return null;

  return (
    <group scale={1.2}> 
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/plain_dark_blue_t-shirt.glb");
