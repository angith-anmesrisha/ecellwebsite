"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import * as THREE from "three";

function WireframeMesh({ position, rotation, type, delay }: { 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  type: "knot" | "sphere"; 
  delay: number; 
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const scrollFactor = Math.min(scrollY / 700, 1);

    const { x, y } = state.pointer;

    // Fluid spatial tracking calculations
    meshRef.current.position.x = position[0] + (x * 0.3) + (position[0] * scrollFactor * 1.2 * delay);
    meshRef.current.position.y = position[1] + (y * 0.3) + (position[1] * scrollFactor * 1.2 * delay);
    meshRef.current.position.z = position[2] + (scrollFactor * -4 * delay);

    // 🌟 THE FIX: Calculating precise time strings via performance oldTime state markers 
    // This bypasses the deprecated THREE.Clock module completely, quieting the Turbopack dev warnings
    const accurateElapsedTime = state.clock.oldTime * 0.001;

    meshRef.current.rotation.x = rotation[0] + (accurateElapsedTime * 0.08 * delay) + (y * 0.1);
    meshRef.current.rotation.y = rotation[1] + (accurateElapsedTime * 0.12 * delay) + (x * 0.1);
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      {type === "knot" ? (
        <torusKnotGeometry args={[0.5, 0.16, 120, 12, 3, 4]} />
      ) : (
        <icosahedronGeometry args={[0.6, 1]} />
      )}
      <meshStandardMaterial 
        color="#a855f7" 
        wireframe={true} 
        wireframeLinewidth={1.5}
        emissive="#6366f1"
        emissiveIntensity={0.6}
        transparent={true}
        opacity={0.35}
      />
    </mesh>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} color="#3b82f6" />
      <directionalLight position={[-5, -5, -5]} intensity={1.2} color="#ec4899" />
      <pointLight position={[0, 0, 3]} intensity={1.5} color="#a855f7" />
    </>
  );
}

export default function HeroCanvas3D() {
  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-80">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "none" }}
      >
        <SceneLighting />
        <Center>
          <group>
            <WireframeMesh type="knot" position={[-1.8, 0.4, -0.5]} rotation={[0.2, 0.5, 0]} delay={0.7} />
            <WireframeMesh type="sphere" position={[1.8, -0.6, 0.2]} rotation={[0.4, -0.2, 0.5]} delay={1.1} />
            <WireframeMesh type="knot" position={[0, 1.6, -1.2]} rotation={[-0.5, 0.3, 0.2]} delay={1.3} />
            <WireframeMesh type="sphere" position={[-0.8, -1.5, -0.2]} rotation={[0.1, 0.4, -0.6]} delay={0.9} />
          </group>
        </Center>
      </Canvas>
    </div>
  );
}