"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useGLTF, Center, Decal } from "@react-three/drei";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export default function ShoppingBag({
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
  const { scene } = useGLTF("/shopping.glb") as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { controls } = useThree() as any;
  const [isDragging, setIsDragging] = useState(false);

  // 1. Mesh Separation & 'getX' Crash Fix
  const { bagMeshes, handleMeshes } = useMemo(() => {
    const bag: any[] = [];
    const handles: any[] = [];

    clonedScene.traverse((n: any) => {
      if (n.isMesh) {
        if (n.geometry && !n.geometry.attributes.normal) {
          n.geometry.computeVertexNormals();
        }

        const name = n.name.toLowerCase();
        
        if (name.includes("shadow") || name.includes("plane") || name.includes("ground") || name.includes("floor")) {
          n.visible = false;
          return;
        }

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

  const decalZ = 0.5; 
  const projectionDepth = 1.0; 

  const handlePointerDown = (e: any) => {
    const hit = e.intersections.find((i: any) => i.object.userData?.isDecal);
    if (hit) {
      e.stopPropagation();
      setSelectedItem(hit.object.userData.type);
      setIsDragging(true);
      if (controls) controls.enabled = false;
    } else {
      // Allow rotation by not stopping propagation
    }
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging || !selectedItem) return;
    e.stopPropagation();

    // The Shopping Bag is centered and scaled. 
    // We can use the intersection point in local space.
    const localPoint = e.object.worldToLocal(e.point.clone());
    
    if (selectedItem === "text") {
      handleUpdateDecal({ textPosX: localPoint.x, textPosY: localPoint.y });
    } else {
      handleUpdateDecal({ imgPosX: localPoint.x, imgPosY: localPoint.y });
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

  return (
    <group 
      scale={2.0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    > 
      <Center>
        {handleMeshes.map((m: any, idx: number) => (
          <mesh key={`handle-${idx}`} geometry={m.geometry} material={m.material} />
        ))}

        {bagMeshes.map((m: any, idx: number) => (
          <mesh key={`bag-${idx}`} geometry={m.geometry} material={m.material}>
            {textTexture && (
              <Decal
                position={[decalConfig.textPosX || 0, decalConfig.textPosY || 0, decalZ]}
                rotation={[0, 0, decalConfig.textRot || 0]}
                scale={[decalConfig.textSize || 1, decalConfig.textSize || 1, projectionDepth]}
                map={textTexture}
                userData={{ isDecal: true, type: "text" }}
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
                position={[decalConfig.imgPosX || 0, decalConfig.imgPosY || 0, decalZ]}
                rotation={[0, 0, decalConfig.imgRot || 0]}
                scale={[decalConfig.imageSize || 1, decalConfig.imageSize || 1, projectionDepth]}
                map={imageTexture}
                userData={{ isDecal: true, type: "image" }}
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