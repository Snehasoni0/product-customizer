"use client";

import { useGLTF } from "@react-three/drei";

export default function MeshInspector({ url }: { url: string }) {
  const { nodes, scene } = useGLTF(url);
  console.log("Nodes:", nodes);
  console.log("Scene:", scene);
  return null;
}
