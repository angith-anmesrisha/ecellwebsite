"use client";

import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
    // Fluid tracking that scales down slightly as you move away
    const scrollFactor = Math.min(scrollY / 700, 1);

    const { x, y } = state.pointer;

    // 🌟 TRIONN MICRO-INTERACTION FIX: Subtly expands outward in depth without breaking layout tracking bounds
    meshRef.current.position.x = position[0] + (x * 0.3) + (position[0] * scrollFactor * 1.2 * delay);
    meshRef.current.position.y = position[1] + (y * 0.3) + (position[1] * scrollFactor * 1.2 * delay);
    meshRef.current.position.z = position[2] + (scrollFactor * -4 * delay);

    // Continuous premium kinetic spinning path
    meshRef.current.rotation.x = rotation[0] + (state.clock.getElapsedTime() * 0.08 * delay) + (y * 0.1);
    meshRef.current.rotation.y = rotation[1] + (state.clock.getElapsedTime() * 0.12 * delay) + (x * 0.1);
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      {type === "knot" ? (
        // Premium intricate structural knot path
        <torusKnotGeometry args={[0.5, 0.16, 120, 12, 3, 4]} />
      ) : (
        // Clean brutalist crystalline geometry sphere
        <icosahedronGeometry args={[0.6, 1]} />
      )}
      <meshStandardMaterial 
        color="#a855f7" 
        wireframe={true} // 🌟 THE FIX: Toggles transparency lines so background elements show through clearly
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
            {/* 🌟 BALANCED LAYOUT CONFIGURATION: Deliberately spaced out to avoid text collisions */}
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