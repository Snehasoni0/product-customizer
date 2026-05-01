"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useGLTF, Center, Decal } from "@react-three/drei";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

export default function ShoppingBag({
  color,
  decalConfig = {},
  selectedItem,
  setSelectedItem,
  handleUpdateDecal,
  modelRotation,
}: {
  color: string;
  decalConfig: any;
  selectedItem: string | null;
  setSelectedItem: (item: string | null) => void;
  handleUpdateDecal: (updates: any) => void;
  modelRotation?: [number, number, number];
}) {
  const { scene } = useGLTF("/shopping.glb") as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  // const { controls, camera, raycaster } = useThree() as any;
  const controls = null as any;
  const [isDragging, setIsDragging] = useState(false);
  const [imgAspect, setImgAspect] = useState(1);
  const [backImgAspect, setBackImgAspect] = useState(1);
  const [stickyMode, setStickyMode] = useState(false);
  const [isOutOfBounds, setIsOutOfBounds] = useState(false);
  const [loadedFont, setLoadedFont] = useState("");

  useEffect(() => {
    const font = decalConfig.fontFamily || "Outfit";
    const weight = font.toLowerCase().includes("playwrite") ? "normal" : "bold";
    document.fonts.load(`${weight} 200px ${font}`).then(() => {
      setLoadedFont(font);
    });
  }, [decalConfig.fontFamily]);

  // Use a ref for dragging state to avoid stale closures in useFrame
  const draggingRef = useRef(false);
  const stickyRef = useRef(false);

  // Rotation tracking for smooth turns
  const targetRotationY = useRef(0);
  const currentRotationY = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  // Update target when prop changes
  useEffect(() => {
    if (Array.isArray(decalConfig.modelRotation)) {
      targetRotationY.current = decalConfig.modelRotation[1] || 0;
    }
  }, [decalConfig.modelRotation]);

  // BOUNDARY CONFIGURATION (Adjust these to move the 'Red Box')
  const minX = -0.4;
  const maxX = 0.45;
  const minY = -0.7;
  const maxY = 0.38;

  useEffect(() => {
    draggingRef.current = isDragging;
  }, [isDragging]);
  useEffect(() => {
    stickyRef.current = stickyMode;
  }, [stickyMode]);

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

        if (
          name.includes("shadow") ||
          name.includes("plane") ||
          name.includes("ground") ||
          name.includes("floor")
        ) {
          n.visible = false;
          return;
        }

        const isStrap =
          name.includes("strap") ||
          name.includes("rope") ||
          name.includes("string") ||
          name.includes("ring") ||
          name.includes("mount") ||
          name.includes("base") ||
          name.includes("cuff");

        if (isStrap) {
          handles.push(n);
        } else {
          // Log part names to help me see what's what
          if (name.includes("handle"))
            console.log("Bag Part (with 'handle' in name):", name);
          bag.push(n);
        }

        // Special case: if it contains 'handle' but is clearly a mount/cuff,
        // we've already handled it by the 'else' above.
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
      mesh.userData.isBagMesh = true; // Mark as bag mesh
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
    const currentFont = decalConfig.fontFamily || "Outfit";
    if (!decalConfig.text || (decalConfig.fontFamily && loadedFont !== currentFont)) return null;
    if (typeof document === "undefined") return null;

    // Temporary canvas to measure text
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return null;

    const font = decalConfig.fontFamily || "Outfit";
    const weight = font.toLowerCase().includes("playwrite") ? "normal" : "bold";
    
    let baseFontSize = 250;
    tempCtx.font = `${weight} ${baseFontSize}px ${font}, sans-serif`;
    let textWidth = tempCtx.measureText(decalConfig.text).width;

    if (textWidth > 1500) {
      const scale = 1500 / textWidth;
      baseFontSize *= scale;
      tempCtx.font = `${weight} ${baseFontSize}px ${font}, sans-serif`;
      textWidth = tempCtx.measureText(decalConfig.text).width;
    }

    const h = baseFontSize * 2.0; // Increased from 1.2 to give much more vertical room
    const padding = 100; // Increased padding
    const totalW = Math.max(textWidth + padding * 2, 100);
    const totalH = Math.max(h + padding * 2, 100);

    // Create the actual canvas with correct dimensions
    const canvas = document.createElement("canvas");
    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, totalW, totalH);

    if (selectedItem === "text") {
      ctx.strokeStyle = isOutOfBounds
        ? "rgba(255, 0, 0, 0.9)"
        : "rgba(255, 255, 255, 0.8)";
      ctx.setLineDash([20, 20]);
      ctx.lineWidth = 15;
      ctx.strokeRect(5, 5, totalW - 10, totalH - 10);
    }

    const fontStyle = decalConfig.fontFamily || "Outfit";
    const weightStyle = fontStyle.toLowerCase().includes("playwrite") ? "normal" : "bold";
    ctx.font = `${weightStyle} ${baseFontSize}px ${fontStyle}, sans-serif`;
    ctx.fillStyle = decalConfig.textColor || "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Vertical offset to prevent clipping
    ctx.fillText(decalConfig.text, totalW / 2, totalH / 2 + 15);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  }, [
    decalConfig.text,
    decalConfig.fontFamily,
    decalConfig.textColor,
    selectedItem,
    loadedFont,
  ]);

  // Synchronous text aspect calculation
  const calculatedTextAspect = useMemo(() => {
    if (!decalConfig.text || typeof document === "undefined") return 1;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return 1;
    let baseFontSize = 250;
    const font = decalConfig.fontFamily || "Outfit";
    const weight = font.toLowerCase().includes("playwrite") ? "normal" : "bold";
    ctx.font = `${weight} ${baseFontSize}px ${font}, sans-serif`;
    let textWidth = ctx.measureText(decalConfig.text).width;
    if (textWidth > 1500) {
      const scale = 1500 / textWidth;
      baseFontSize *= scale;
      ctx.font = `${weight} ${baseFontSize}px ${font}, sans-serif`;
      textWidth = ctx.measureText(decalConfig.text).width;
    }
    const h = baseFontSize * 2.0;
    const padding = 100;
    return (
      Math.max(textWidth + padding * 2, 100) / Math.max(h + padding * 2, 100)
    );
  }, [decalConfig.text, decalConfig.textColor, decalConfig.fontFamily, loadedFont]);

  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Effect to load image and manage its aspect ratio
  useEffect(() => {
    if (!decalConfig.image) {
      loadedImageRef.current = null;
      setImageLoaded(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = decalConfig.image;
    img.onload = () => {
      loadedImageRef.current = img;
      setImgAspect(img.width / img.height);
      setImageLoaded(true);
    };
  }, [decalConfig.image]);

  const loadedBackImageRef = useRef<HTMLImageElement | null>(null);
  const [backImageLoaded, setBackImageLoaded] = useState(false);

  useEffect(() => {
    if (!decalConfig.backImage) {
      loadedBackImageRef.current = null;
      setBackImageLoaded(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = decalConfig.backImage;
    img.onload = () => {
      loadedBackImageRef.current = img;
      setBackImgAspect(img.width / img.height);
      setBackImageLoaded(true);
    };
  }, [decalConfig.backImage]);

  // 4. Image Texture Loader
  const imageTexture = useMemo(() => {
    if (!decalConfig.image || !imageLoaded || !loadedImageRef.current)
      return null;

    const img = loadedImageRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (selectedItem === "image") {
      ctx.strokeStyle = isOutOfBounds
        ? "rgba(255, 0, 0, 0.9)"
        : "rgba(255, 255, 255, 0.8)";
      ctx.setLineDash([canvas.width / 15, canvas.width / 15]);
      ctx.lineWidth = canvas.width / 30;
      ctx.strokeRect(
        ctx.lineWidth / 2,
        ctx.lineWidth / 2,
        canvas.width - ctx.lineWidth,
        canvas.height - ctx.lineWidth,
      );
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  }, [decalConfig.image, selectedItem, imageLoaded]);

  const backImageTexture = useMemo(() => {
    if (
      !decalConfig.backImage ||
      !backImageLoaded ||
      !loadedBackImageRef.current
    )
      return null;

    const img = loadedBackImageRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  }, [decalConfig.backImage, backImageLoaded]);

  const decalZ = 0.72;
  const decalZImage = 0.74;
  const projectionDepth = 1.0;

  const handlePointerDown = (e: any) => {
    const decalHit = e.intersections.find(
      (i: any) => i.object.userData?.isDecal,
    );

    if (stickyRef.current) {
      setStickyMode(false);
      if (controls) controls.enabled = true;
      return;
    }

    if (decalHit && selectedItem === decalHit.object.userData.type) {
      e.stopPropagation();
      setIsDragging(true);
      if (controls) {
        controls.enabled = false;
        controls.update();
      }
    }
  };

  const handleDoubleClick = (e: any) => {
    const decalHit = e.intersections.find(
      (i: any) => i.object.userData?.isDecal,
    );

    if (decalHit) {
      e.stopPropagation();
      const type = decalHit.object.userData.type;

      if (selectedItem === type) {
        const newSticky = !stickyMode;
        setStickyMode(newSticky);
        if (controls) {
          controls.enabled = !newSticky;
          controls.update();
        }
      } else {
        setSelectedItem(type);
        setStickyMode(false);
      }
    } else {
      setSelectedItem(null);
      setStickyMode(false);
      if (controls) controls.enabled = true;
    }
  };

  // 4. Update Target Rotation from Props
  useEffect(() => {
    if (modelRotation) {
      targetRotationY.current = modelRotation[1];
    }
  }, [modelRotation]);

  // 5. High-Performance Drag Logic & Smooth Rotation
  useFrame((state, delta) => {
    // A. Smooth Rotation Animation
    if (groupRef.current) {
      // Lerp the rotation for a premium 'turn' feel
      currentRotationY.current = THREE.MathUtils.lerp(
        currentRotationY.current,
        targetRotationY.current,
        0.1, // Adjust for speed (lower = slower/smoother)
      );
      groupRef.current.rotation.y = currentRotationY.current;
    }

    if ((!draggingRef.current && !stickyRef.current) || !selectedItem) return;

    // Raycast from mouse directly onto bag meshes
    state.raycaster.setFromCamera(state.mouse, state.camera);
    const intersects = state.raycaster.intersectObjects(bagMeshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const localPoint = hit.object.worldToLocal(hit.point.clone());

      let currentHalfW = 0.1;
      let currentHalfH = 0.1;

      if (selectedItem === "text") {
        currentHalfW = (decalConfig.textSize * calculatedTextAspect) / 2;
        currentHalfH = decalConfig.textSize / 2;
      } else {
        currentHalfW = (decalConfig.imageSize * imgAspect) / 2;
        currentHalfH = decalConfig.imageSize / 2;
      }

      // Check if we ARE hitting a wall (for red alert)
      const wouldBeX = localPoint.x;
      const wouldBeY = localPoint.y;
      const oob =
        wouldBeX < minX + currentHalfW ||
        wouldBeX > maxX - currentHalfW ||
        wouldBeY < minY + currentHalfH ||
        wouldBeY > maxY - currentHalfH;
      setIsOutOfBounds(oob);

      // Clamp the positions so the EDGES stay within the bag surface
      const clampedX = Math.max(
        minX + currentHalfW,
        Math.min(maxX - currentHalfW, localPoint.x),
      );
      const clampedY = Math.max(
        minY + currentHalfH,
        Math.min(maxY - currentHalfH, localPoint.y),
      );

      if (selectedItem === "text") {
        handleUpdateDecal({ textPosX: clampedX, textPosY: clampedY });
      } else {
        handleUpdateDecal({ imgPosX: clampedX, imgPosY: clampedY });
      }
    }
  });

  useEffect(() => {
    const handlePointerUp = () => {
      if (!stickyRef.current) {
        setIsDragging(false);
        if (controls) controls.enabled = true;
      }
    };
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, [controls]);

  return (
    <group
      ref={groupRef}
      scale={2.0}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      {handleMeshes.map((m: any, idx: number) => (
        <mesh
          key={`handle-${idx}`}
          geometry={m.geometry}
          material={m.material}
        />
      ))}

      {bagMeshes.map((m: any, idx: number) => (
        <mesh key={`bag-${idx}`} geometry={m.geometry} material={m.material}>
          {textTexture && (
            <Decal
              position={[
                decalConfig.textPosX || 0,
                decalConfig.textPosY || 0,
                decalZ,
              ]}
              rotation={[0, 0, decalConfig.textRot || 0]}
              scale={[
                decalConfig.textSize * calculatedTextAspect || 1,
                decalConfig.textSize || 1,
                projectionDepth,
              ]}
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
                side={THREE.FrontSide}
              />
            </Decal>
          )}

          {imageTexture && (
            <Decal
              position={[
                decalConfig.imgPosX || 0,
                decalConfig.imgPosY || 0,
                decalZImage,
              ]}
              rotation={[-0.04, 0, decalConfig.imgRot || 0]}
              scale={[
                decalConfig.imageSize * imgAspect || 1,
                decalConfig.imageSize || 1,
                projectionDepth,
              ]}
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
                side={THREE.FrontSide}
              />
            </Decal>
          )}

          {backImageTexture && (
            <Decal
              // debug
              // Center the decal vertically based on your bag's minY (-0.7) and maxY (0.38)
              position={[0, -0.20, -0.98]}
              rotation={[0.049, Math.PI, 0]}
              // Use a base scale of 1.5 (which exceeds your bag's max width/height of ~1.08)
              // and multiply by the aspect ratio to create an "object-fit: cover" effect
              scale={[
                backImgAspect > 1 ? 1.5 * backImgAspect : 1.5,
                backImgAspect > 1 ? 1.5 : 1.5 / backImgAspect,
                1.5, // Increased depth slightly to ensure it projects through any folds
              ]}
              map={backImageTexture}
            >
              <meshStandardMaterial
                map={backImageTexture}
                transparent
                polygonOffset
                polygonOffsetFactor={-12}
                depthTest={true}
                depthWrite={false}
                side={THREE.FrontSide}
              />
            </Decal>
          )}
        </mesh>
      ))}
    </group>
  );
}

useGLTF.preload("/shopping.glb");
