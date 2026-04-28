"use client";

import React, { useEffect, useMemo } from "react";
import { useGLTF, Center, Decal } from "@react-three/drei";
import * as THREE from "three";

export default function ShoppingBag({
  color,
  decalConfig = {},
}: {
  color: string;
  decalConfig: any;
}) {
  const { scene } = useGLTF("/shopping.glb") as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  // 1. Mesh Separation & 'getX' Crash Fix
  const { bagMeshes, handleMeshes } = useMemo(() => {
    const bag: any[] = [];
    const handles: any[] = [];

    clonedScene.traverse((n: any) => {
      if (n.isMesh) {
        // Fix missing normals to prevent Decal crash
        if (n.geometry && !n.geometry.attributes.normal) {
          n.geometry.computeVertexNormals();
        }

        const name = n.name.toLowerCase();
        
        // Hide environment/shadows
        if (name.includes("shadow") || name.includes("plane") || name.includes("ground") || name.includes("floor")) {
          n.visible = false;
          return;
        }

        // Separate handles from main body
        if (name.includes("handle") || name.includes("strap") || name.includes("rope") || name.includes("ring")) {
          handles.push(n);
        } else {
          bag.push(n);
        }
      }
    });
    return { bagMeshes: bag, handleMeshes: handles };
  }, [clonedScene]);

  // 2. Base Color Application
  useEffect(() => {
    bagMeshes.forEach((mesh) => {
      if (!mesh.userData.isCustomized) {
        mesh.material = mesh.material.clone();
        mesh.userData.isCustomized = true;
      }
      mesh.material.color.set(color || "#ffffff");
      mesh.material.map = null; 
      mesh.material.side = THREE.DoubleSide;
      mesh.material.needsUpdate = true;
    });

    handleMeshes.forEach((mesh) => {
      if (!mesh.userData.isCustomized) {
        mesh.material = mesh.material.clone();
        mesh.userData.isCustomized = true;
      }
      mesh.material.color.set(color || "#ffffff");
      mesh.material.needsUpdate = true;
    });
  }, [bagMeshes, handleMeshes, color]);

  // 3. Text Texture Generator (High Res)
  const textTexture = useMemo(() => {
    if (!decalConfig.text) return null;
    if (typeof document === "undefined") return null; 

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, 1024, 1024);

    let baseFontSize = 250; 
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

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  }, [decalConfig.text, decalConfig.fontFamily, decalConfig.textColor]);

  // 4. Image Texture Loader
  const imageTexture = useMemo(() => {
    if (!decalConfig.image) return null;
    return new THREE.TextureLoader().load(decalConfig.image);
  }, [decalConfig.image]);

  // Projector Settings (Balanced to hit front wall ONLY)
  const decalZ = 0.5; // Projector is slightly in front of the bag
  const projectionDepth = 1.0; // Beam length is short enough to not hit the back wall

  return (
    <group scale={2.0}> 
      <Center>
        {/* Render Handles */}
        {handleMeshes.map((m: any, idx: number) => (
          <mesh key={`handle-${idx}`} geometry={m.geometry} material={m.material} />
        ))}

        {/* Render Bag Body with Decals */}
        {bagMeshes.map((m: any, idx: number) => (
          <mesh key={`bag-${idx}`} geometry={m.geometry} material={m.material}>
            
            {/* Text Decal */}
            {textTexture && (
              <Decal
                position={[decalConfig.textPosX || 0, decalConfig.textPosY || 0, decalZ]}
                rotation={[0, 0, decalConfig.textRot || 0]}
                scale={[decalConfig.textSize || 1, decalConfig.textSize || 1, projectionDepth]}
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

            {/* Image Decal */}
            {imageTexture && (
              <Decal
                position={[decalConfig.imgPosX || 0, decalConfig.imgPosY || 0, decalZ]}
                rotation={[0, 0, decalConfig.imgRot || 0]}
                scale={[decalConfig.imageSize || 1, decalConfig.imageSize || 1, projectionDepth]}
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
        ))}
      </Center>
    </group>
  );
}

useGLTF.preload("/shopping.glb");