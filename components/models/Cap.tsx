"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

export default function Cap({
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
  const { scene } = useGLTF("/baseball_cap.glb") as any;
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const { controls } = useThree() as any;
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const targetRotationY = useRef(0);
  const currentRotationY = useRef(0);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const p = (val: any, def = 0) => (val !== undefined ? val / 100 : def);

  const unifiedMesh = useMemo(() => {
    clonedScene.updateMatrixWorld(true);
    const geometries: THREE.BufferGeometry[] = [];
    clonedScene.traverse((node: any) => {
      if (node.isMesh) {
        const clonedGeom = node.geometry.clone();
        node.updateWorldMatrix(true, false);
        clonedGeom.applyMatrix4(node.matrixWorld); 
        geometries.push(clonedGeom);
      }
    });
    if (geometries.length === 0) return null;
    const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, true);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.4, 
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    return new THREE.Mesh(mergedGeometry, material);
  }, [clonedScene, color]);

  const findSurfaceAt = (localX: number, localY: number, isBack: boolean) => {
    if (!meshRef.current) return null;
    const originZ = isBack ? -10 : 10;
    const worldOrigin = meshRef.current.localToWorld(new THREE.Vector3(localX, localY, originZ));
    const worldTarget = meshRef.current.localToWorld(new THREE.Vector3(localX, localY, 0));
    raycaster.set(worldOrigin, worldTarget.clone().sub(worldOrigin).normalize());
    const intersects = raycaster.intersectObject(meshRef.current);
    if (intersects.length > 0) {
      const hit = intersects[0];
      const localHitPoint = meshRef.current.worldToLocal(hit.point.clone());
      return { z: localHitPoint.z, normal: hit.face?.normal.clone() };
    }
    return null;
  };

  useEffect(() => {
    const updateSurface = (type: "text" | "image") => {
      const x = (type === "text" ? decalConfig.textPosX : decalConfig.imgPosX) || 0;
      const y = ((type === "text" ? decalConfig.textPosY : decalConfig.imgPosY) - 0.5) * 3 || 0;
      
      const currentNormal = type === "text" ? decalConfig.textNormal : decalConfig.imgNormal;
      const isBack = currentNormal ? currentNormal[2] < 0 : (type === "image");

      const surface = findSurfaceAt(x, y, isBack);
      if (surface && surface.normal) {
        const updates: any = {};
        const n = [surface.normal.x, surface.normal.y, surface.normal.z];
        if (type === "text") { updates.textNormal = n; updates.textPosZ = surface.z; }
        else { updates.imgNormal = n; updates.imgPosZ = surface.z; }
        handleUpdateDecal(updates);
      }
    };
    updateSurface("text"); updateSurface("image");
  }, [decalConfig.textPosX, decalConfig.textPosY, decalConfig.imgPosX, decalConfig.imgPosY]);

  const [textAspect, setTextAspect] = useState(1);
  const [loadedFont, setLoadedFont] = useState("");

  useEffect(() => {
    const font = decalConfig.fontFamily || "Outfit";
    const weight = font.toLowerCase().includes("playwrite") ? "normal" : "bold";
    document.fonts.load(`${weight} 150px ${font}`).then(() => {
      setLoadedFont(font);
    });
  }, [decalConfig.fontFamily]);

  const textTexture = useMemo(() => {
    const currentFont = decalConfig.fontFamily || "Outfit";
    if (!decalConfig.text || (decalConfig.fontFamily && loadedFont !== currentFont)) return null;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    
    const font = decalConfig.fontFamily || "Outfit";
    const weight = font.toLowerCase().includes("playwrite") ? "normal" : "bold";
    ctx.font = `${weight} 150px ${font}, sans-serif`;
    
    const textWidth = ctx.measureText(decalConfig.text).width;
    const width = Math.max(textWidth + 150, 300);
    const height = 500; 
    canvas.width = width; 
    canvas.height = height;
    setTextAspect(width / height);
    
    ctx.font = `${weight} 150px ${font}, sans-serif`;
    ctx.fillStyle = decalConfig.textColor || "#ffffff";
    ctx.textAlign = "center"; 
    ctx.textBaseline = "middle";
    

    ctx.fillText(decalConfig.text, width / 2, height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [decalConfig.text, decalConfig.textColor, decalConfig.fontFamily, loadedFont]);

  const [imgAspect, setImgAspect] = useState(1);
  const imageTexture = useMemo(() => {
    if (!decalConfig.image) return null;
    return new THREE.TextureLoader().load(decalConfig.image, (tex) => {
      if (tex.image) setImgAspect(tex.image.width / tex.image.height);
    });
  }, [decalConfig.image]);

  const getRotation = (normalArr: any, rot: number): [number, number, number] => {
    const normal = new THREE.Vector3(...(normalArr || [0, 0, 1]));
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    const baseRot = normal.z < 0 ? Math.PI : 0;
    const uq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rot + baseRot);
    const euler = new THREE.Euler().setFromQuaternion(q.multiply(uq));
    return [euler.x, euler.y, euler.z];
  };

  const getOffsetPos = (px: number, py: number, pz: number, normalArr: any): [number, number, number] => {
    const pos = new THREE.Vector3(px, py, pz);
    const normal = new THREE.Vector3(...(normalArr || [0, 0, 1]));
    pos.add(normal.clone().multiplyScalar(0.15));
    return [pos.x, pos.y, pos.z];
  };

  useEffect(() => {
    const up = () => { if (controls) controls.enabled = true; };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [controls]);

  useEffect(() => {
    if (Array.isArray(decalConfig.modelRotation)) {
      targetRotationY.current = decalConfig.modelRotation[1] || 0;
    }
  }, [decalConfig.modelRotation]);

  useFrame(() => {
    if (groupRef.current) {
      currentRotationY.current = THREE.MathUtils.lerp(
        currentRotationY.current,
        targetRotationY.current,
        0.1, 
      );
      groupRef.current.rotation.y = currentRotationY.current;
    }
  });

  if (!unifiedMesh) return null;

  return (
    <group ref={groupRef} scale={15} position={[0, -15, 0]}>
      <mesh
        ref={meshRef}
        geometry={unifiedMesh.geometry}
        material={unifiedMesh.material}
        onPointerDown={(e) => {
          const hit = e.intersections.find((i: any) => i.object.userData.isDecal);
          if (hit) {
            e.stopPropagation();
            setSelectedItem(hit.object.userData.type);
          } else if (selectedItem) setSelectedItem(null);
        }}
      >
        {textTexture && (
          <Decal
            position={getOffsetPos(decalConfig.textPosX || 0, (decalConfig.textPosY - 0.5) * 3 || 0, decalConfig.textPosZ || 0, decalConfig.textNormal)}
            rotation={getRotation(decalConfig.textNormal, decalConfig.textRot)}
            scale={[decalConfig.textSize * 1.5 * textAspect, decalConfig.textSize * 1.5, 0.3]}
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
            position={getOffsetPos(decalConfig.imgPosX || 0, (decalConfig.imgPosY - 0.5) * 3 || 0, decalConfig.imgPosZ || 0, decalConfig.imgNormal)}
            rotation={getRotation(decalConfig.imgNormal, decalConfig.imgRot)}
            scale={[decalConfig.imageSize * 1.5 * imgAspect, decalConfig.imageSize * 1.5, 0.3]}
            userData={{ isDecal: true, type: "image" }}
          >
            <meshStandardMaterial 
              map={imageTexture} 
              transparent 
              polygonOffset 
              polygonOffsetFactor={-10} 
              depthTest={true} 
              depthWrite={false} 
              side={THREE.FrontSide}
            />
          </Decal>
        )}
      </mesh>
    </group>
  );
}

useGLTF.preload("/baseball_cap.glb");