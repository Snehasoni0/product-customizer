"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

export default function TShirt({
  color,
  decalConfig = {},
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
  const { scene } = useGLTF("/plain_dark_blue_t-shirt.glb") as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { controls } = useThree() as any;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasTexture, setCanvasTexture] =
    useState<THREE.CanvasTexture | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const targetRotationY = useRef(0);
  const currentRotationY = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const prevImageRef = useRef<string | null>(null);


  const FRONT_ZONE = { minX: 1100, maxX: 1650, minY: 1100, maxY: 1300, rot: 0.07 }; 
  const BACK_ZONE = { minX: 250, maxX: 750, minY: 950, maxY: 1400, rot: 0.35 };

  useEffect(() => {
    if (typeof document !== "undefined" && !canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 2048;
      canvasRef.current = canvas;

      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = true;
      texture.anisotropy = 16;
      texture.colorSpace = THREE.SRGBColorSpace;

      setCanvasTexture(texture);
    }
  }, []);

  useEffect(() => {
    if (decalConfig.image && !prevImageRef.current) {
      targetRotationY.current = Math.PI;
    }
    prevImageRef.current = decalConfig.image;
  }, [decalConfig.image]);

  useEffect(() => {
    if (decalConfig.modelRotation) {
      targetRotationY.current = decalConfig.modelRotation[1];
    }
  }, [decalConfig.modelRotation]);

  useFrame(() => {
    if (groupRef.current) {
      currentRotationY.current = THREE.MathUtils.lerp(
        currentRotationY.current,
        targetRotationY.current,
        0.08,
      );
      groupRef.current.rotation.y = currentRotationY.current;
    }
  });

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

        if (
          meshName.includes("shirt") ||
          meshName.includes("body") ||
          meshName.includes("fabric")
        ) {
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

  useEffect(() => {
    if (!canvasTexture || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderCanvas = async () => {
      const font = decalConfig.fontFamily || "Outfit";
      const weight = font.toLowerCase().includes("playwrite") ? "normal" : "bold";
      
      await document.fonts.load(`${weight} 400px ${font}`);

      ctx.fillStyle = color || "#ffffff";
      ctx.fillRect(0, 0, 2048, 2048);

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

          let rawX = 1024 + iPosX * 512;
          let rawY = 1024 - iPosY * 512;
          const w = 400 * iSize * 2;

          const x = Math.max(BACK_ZONE.minX + w/2, Math.min(BACK_ZONE.maxX - w/2, rawX));
          const y = Math.max(BACK_ZONE.minY + w/2, Math.min(BACK_ZONE.maxY - w/2, rawY));

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(iRot);
          
          if (selectedItem === "image") {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.setLineDash([20, 20]);
            ctx.lineWidth = 10;
            ctx.strokeRect(-w / 2, -w / 2, w, w);
          }

          ctx.drawImage(img, -w / 2, -w / 2, w, w);
          ctx.restore();
        } catch (error) {
          console.error("Image load error:", error);
        }
      }

      if (decalConfig.text) {
        const tPosX = Number(decalConfig.textPosX) || 0;
        const tPosY = Number(decalConfig.textPosY) || 0;
        const tSize = Number(decalConfig.textSize) || 1;
        const tRot = Number(decalConfig.textRot) || 0;

        let rawX = 1024 + tPosX * 512; 
        let rawY = 1024 - tPosY * 512;
        const fontSize = 150 * tSize;

        const x = Math.max(FRONT_ZONE.minX, Math.min(FRONT_ZONE.maxX, rawX));
        const y = Math.max(FRONT_ZONE.minY, Math.min(FRONT_ZONE.maxY, rawY));

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tRot);

        ctx.font = `${weight} ${fontSize}px ${font}, sans-serif`;

        if (selectedItem === "text") {
          const textWidth = ctx.measureText(decalConfig.text).width;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.setLineDash([15, 15]);
          ctx.lineWidth = 8;
          ctx.strokeRect(
            -textWidth / 2,
            -fontSize / 2 - 20, 
            textWidth,
            fontSize + 40,
          );
        }

        ctx.fillStyle = decalConfig.textColor || "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        ctx.fillText(decalConfig.text, 0, 10);
        ctx.restore();
      }

      canvasTexture.needsUpdate = true;
    };

    renderCanvas();
  }, [decalConfig.text, decalConfig.textColor, decalConfig.textSize, decalConfig.textPosX, decalConfig.textPosY, decalConfig.textRot, decalConfig.fontFamily, decalConfig.image, decalConfig.imageSize, decalConfig.imgPosX, decalConfig.imgPosY, decalConfig.imgRot, color, canvasTexture, selectedItem]);

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

  const handlePointerDown = (e: any) => {
    if (!e.uv) return;

    const clickPosX = (e.uv.x - 0.5) * 4;
    const clickPosY = (e.uv.y - 0.5) * 4;

    const distText = Math.sqrt(
      Math.pow(clickPosX - decalConfig.textPosX, 2) +
        Math.pow(clickPosY - decalConfig.textPosY, 2),
    );
    const textThreshold = (decalConfig.textSize || 1) * 0.4;

    const distImg = Math.sqrt(
      Math.pow(clickPosX - decalConfig.imgPosX, 2) +
        Math.pow(clickPosY - decalConfig.imgPosY, 2),
    );
    const imgThreshold = (decalConfig.imageSize || 1) * 0.4;

    if (distText < textThreshold && selectedItem === "text") {
      e.stopPropagation();
      setIsDragging(true);
      if (controls) controls.enabled = false;
    } else if (distImg < imgThreshold && selectedItem === "image") {
      e.stopPropagation();
      setIsDragging(true);
      if (controls) controls.enabled = false;
    }
  };

  const handleDoubleClick = (e: any) => {
    if (!e.uv) return;
    const clickPosX = (e.uv.x - 0.5) * 4;
    const clickPosY = (e.uv.y - 0.5) * 4;

    const distText = Math.sqrt(
      Math.pow(clickPosX - decalConfig.textPosX, 2) +
        Math.pow(clickPosY - decalConfig.textPosY, 2),
    );
    const textThreshold = (decalConfig.textSize || 1) * 0.4;
    const distImg = Math.sqrt(
      Math.pow(clickPosX - decalConfig.imgPosX, 2) +
        Math.pow(clickPosY - decalConfig.imgPosY, 2),
    );
    const imgThreshold = (decalConfig.imageSize || 1) * 0.4;

    if (distText < textThreshold) {
      e.stopPropagation();
      setSelectedItem("text");
    } else if (distImg < imgThreshold) {
      e.stopPropagation();
      setSelectedItem("image");
    } else {
      setSelectedItem(null);
    }
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || !selectedItem || !e.uv) return;
    e.stopPropagation();

    const u = e.uv.x;
    const v = e.uv.y;

    let px = u * 2048;
    let py = (1 - v) * 2048;

    const zone = selectedItem === "text" ? FRONT_ZONE : BACK_ZONE;
    
    const padding = 10;
    const clampedPx = Math.max(zone.minX + padding, Math.min(zone.maxX - padding, px));
    const clampedPy = Math.max(zone.minY + padding, Math.min(zone.maxY - padding, py));

    const finalPosX = (clampedPx - 1024) / 512;
    const finalPosY = (1024 - clampedPy) / 512;

    if (selectedItem === "text") {
      handleUpdateDecal({ textPosX: finalPosX, textPosY: finalPosY });
    } else {
      handleUpdateDecal({ imgPosX: finalPosX, imgPosY: finalPosY });
    }
  };

  useEffect(() => {
    const handlePointerUp = () => {
      setIsDragging(false);
      if (controls) controls.enabled = true;
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [controls]);

  if (!canvasTexture) return null;

  return (
    <group
      ref={groupRef}
      scale={1.2}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onDoubleClick={handleDoubleClick}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/plain_dark_blue_t-shirt.glb");
