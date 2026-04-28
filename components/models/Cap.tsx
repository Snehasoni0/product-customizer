"use client";

import React, { useEffect, useMemo } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import * as THREE from "three";

export default function Cap({
  color,
  decalConfig,
}: {
  color: string;
  decalConfig: any;
}) {
  const { nodes } = useGLTF("/baseball_cap.glb") as any;

  const mesh = useMemo(() => {
    return Object.values(nodes).find((n: any) => n.isMesh) as any;
  }, [nodes]);

  useEffect(() => {
    if (!mesh) return;
    const material = mesh.material.clone();
    material.color.set(color);
    material.side = THREE.DoubleSide;
    
    // Strip original textures
    material.map = null;
    material.normalMap = null;
    material.roughnessMap = null;
    material.metalnessMap = null;
    material.aoMap = null;
    
    mesh.material = material;
  }, [mesh, color]);

  const textTexture = useMemo(() => {
    if (!decalConfig.text) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, 1024, 1024);
    let baseFontSize = (decalConfig.fontSize || 100) * 4;
    ctx.font = `bold ${baseFontSize}px ${decalConfig.fontFamily || "Arial"}`;
    let textWidth = ctx.measureText(decalConfig.text).width;

    if (textWidth > 980) {
      const scale = 980 / textWidth;
      baseFontSize *= scale;
      ctx.font = `bold ${baseFontSize}px ${decalConfig.fontFamily || "Arial"}`;
    }

    ctx.fillStyle = decalConfig.textColor || "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(decalConfig.text, 512, 512);

    return new THREE.CanvasTexture(canvas);
  }, [
    decalConfig.text,
    decalConfig.fontSize,
    decalConfig.fontFamily,
    decalConfig.textColor,
  ]);

  const imageTexture = useMemo(() => {
    if (!decalConfig.image) return null;
    return new THREE.TextureLoader().load(decalConfig.image);
  }, [decalConfig.image]);

  if (!mesh) return null;

  return (
    <group scale={1.6}>
      <mesh geometry={mesh.geometry} material={mesh.material}>
        {textTexture && (
          <Decal
            position={[decalConfig.textPosX || 0, decalConfig.textPosY || 0.1, 0.35]}
            rotation={[0, 0, decalConfig.textRot || 0]}
            scale={decalConfig.textSize || 0.4}
            map={textTexture}
          >
            <meshStandardMaterial
              map={textTexture}
              transparent
              polygonOffset
              polygonOffsetFactor={-10}
              depthTest={true}
              depthWrite={false}
            />
          </Decal>
        )}
        {imageTexture && (
          <Decal
            position={[decalConfig.imgPosX || 0, decalConfig.imgPosY || 0.3, 0.32]}
            rotation={[0, 0, decalConfig.imgRot || 0]}
            scale={decalConfig.imageSize || 0.3}
            map={imageTexture}
          >
            <meshStandardMaterial
              map={imageTexture}
              transparent
              polygonOffset
              polygonOffsetFactor={-11}
              depthTest={true}
              depthWrite={false}
            />
          </Decal>
        )}
      </mesh>
    </group>
  );
}

useGLTF.preload("/baseball_cap.glb");