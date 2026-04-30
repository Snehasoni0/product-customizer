"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage, Center, Html } from "@react-three/drei";
import { Suspense } from "react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  const clonedScene = scene.clone();
  clonedScene.traverse((child: any) => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      child.material.color.set("#ffffff");
      child.material.map = null; 
      child.material.normalMap = null;
      child.material.roughnessMap = null;
      child.material.metalnessMap = null;
      child.material.aoMap = null;
      child.material.emissive.set("#000000");
      child.material.vertexColors = false;
      child.material.needsUpdate = true;
    }
  });

  return <primitive object={clonedScene} />;
}

export default function ModelPreview({ modelUrl, title }: { modelUrl: string, title: string }) {
  return (
    <div style={{ height: "100%", width: "100%", cursor: "grab", position: "relative" }}>
      <Canvas shadows camera={{ position: [0, 0, 150], fov: 40 }}>
        <Suspense fallback={<Html center style={{ color: 'white', whiteSpace: 'nowrap', fontWeight: '500' }}>Loading {title}...</Html>}>
          <Stage 
            adjustCamera={1.2} 
            intensity={0.5} 
            environment="city" 
            preset="rembrandt" 
            shadows="contact"
          >
            <Model url={modelUrl} />
          </Stage>
        </Suspense>
        <OrbitControls 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={2}
          makeDefault 
        />
      </Canvas>
    </div>
  );
}
