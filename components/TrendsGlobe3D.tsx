"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface StoryItem {
  objectID: string;
  title: string;
}

interface Trends3DProps {
  stories: StoryItem[];
  hoveredIdx: number | null;
  setHoveredIdx: (idx: number | null) => void;
  setActiveIdx: (idx: number) => void;
}

function HologramModel() {
  const { scene } = useGLTF("/earth2.glb");
  const modelRef = useRef<THREE.Group>(null);

  // 🌟 SYNTAX FIX: Restored the missing useMemo declaration wrapper wrapper down below
  useMemo(() => {
    scene.traverse((child) => {
      // 1. Instantly hide any explicit line primitives inside the file map
      if (child instanceof THREE.Line || (child as any).isLine || child instanceof THREE.LineSegments) {
        child.visible = false; 
        if ((child as THREE.Line).material) {
          const mat = (child as THREE.Line).material as THREE.Material;
          mat.transparent = true;
          mat.opacity = 0;
          mat.visible = false;
        }
      }
      
      // 2. Scan every single element name for structural helper artifacts
      const nameLower = child.name.toLowerCase();
      const isTargetNode = 
        nameLower.includes("line") || 
        nameLower.includes("track") || 
        nameLower.includes("orbit") || 
        nameLower.includes("grid") ||
        nameLower.includes("helper");

      if (isTargetNode) {
        child.visible = false;
      }

      // 3. Force any solid mesh structures carrying pitch-black materials to become completely invisible
      if (child instanceof THREE.Mesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        
        materials.forEach((mat: any) => {
          if (mat && mat.color) {
            const hexColor = mat.color.getHexString();
            
            // Catching raw pitch black, near-black, or unassigned dark grey structural artifacts
            if (
              hexColor === "000000" || 
              hexColor.startsWith("0") || 
              hexColor.startsWith("1") || 
              isTargetNode
            ) {
              child.visible = false;
              mat.visible = false;
              mat.transparent = true;
              mat.opacity = 0;
              mat.wireframe = false; 
            }
          }
        });
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!modelRef.current) return;
    modelRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <primitive 
      ref={modelRef} 
      object={scene} 
      scale={2.2} 
      position={[0, 0, 0]} 
    />
  );
}

function ArtificialSatelliteGeometry({ isHovered }: { isHovered: boolean }) {
  const color = isHovered ? "#22d3ee" : "#a855f7";
  const emissive = isHovered ? "#06b6d4" : "#6b21a8";

  return (
    <group>
      {/* Central Instrument Chassis Module */}
      <mesh>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissive} 
          emissiveIntensity={3} 
          metalness={0.9} 
          roughness={0.1} 
        />
      </mesh>
      {/* Left Solar Array Panel */}
      <mesh position={[-0.1, 0, 0]}>
        <boxGeometry args={[0.1, 0.03, 0.01]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={1} roughness={0.3} />
      </mesh>
      {/* Right Solar Array Panel */}
      <mesh position={[0.1, 0, 0]}>
        <boxGeometry args={[0.1, 0.03, 0.01]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

function SatelliteHardware({ 
  index, 
  total, 
  isHovered, 
  onHover, 
  onClick 
}: { 
  index: number; 
  total: number; 
  isHovered: boolean; 
  onHover: (hovered: boolean) => void; 
  onClick: () => void;
}) {
  const hardwareGroupRef = useRef<THREE.Group>(null);
  const targetLineRef = useRef<THREE.Line>(null);

  const customTelemetryLine = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color("#22d3ee"),
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    return new THREE.Line(geom, mat);
  }, []);

  const orbitParameters = useMemo(() => {
    const radius = 1.35 + (index * 0.05); 
    const inclination = (index * (Math.PI / 3)) + 0.2; 
    const longitudeNode = (index * (Math.PI * 2)) / total; 

    return { radius, inclination, longitudeNode };
  }, [index, total]);

  const orbitPathPoints = useMemo(() => {
    const points = [];
    const segments = 64;
    const { radius, inclination, longitudeNode } = orbitParameters;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const localX = Math.cos(theta) * radius;
      const localZ = Math.sin(theta) * radius;

      const globalX = localX * Math.cos(longitudeNode) - localZ * Math.sin(longitudeNode) * Math.cos(inclination);
      const globalY = localZ * Math.sin(inclination);
      const globalZ = localX * Math.sin(longitudeNode) + localZ * Math.cos(longitudeNode) * Math.cos(inclination);

      points.push(new THREE.Vector3(globalX, globalY, globalZ));
    }
    return new THREE.CatmullRomCurve3(points).getPoints(64);
  }, [orbitParameters]);

  const orbitTrackMesh = useMemo(() => {
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(orbitPathPoints),
      new THREE.LineBasicMaterial({ 
        color: new THREE.Color("#a855f7"), 
        transparent: true, 
        opacity: isHovered ? 0.25 : 0.0 
      })
    );
  }, [orbitPathPoints, isHovered]);

  useFrame((state) => {
    if (!hardwareGroupRef.current) return;
    
    const time = state.clock.getElapsedTime() * 0.12; 
    const angle = time + (index * 4.0); 

    const { radius, inclination, longitudeNode } = orbitParameters;

    const localX = Math.cos(angle) * radius;
    const localZ = Math.sin(angle) * radius;

    const posX = localX * Math.cos(longitudeNode) - localZ * Math.sin(longitudeNode) * Math.cos(inclination);
    const posY = localZ * Math.sin(inclination);
    const posZ = localX * Math.sin(longitudeNode) + localZ * Math.cos(longitudeNode) * Math.cos(inclination);

    hardwareGroupRef.current.position.set(posX, posY, posZ);
    hardwareGroupRef.current.lookAt(0, 0, 0);

    if (isHovered && targetLineRef.current) {
      const positions = targetLineRef.current.geometry.attributes.position.array as Float32Array;
      positions[0] = posX;
      positions[1] = posY;
      positions[2] = posZ;
      positions[3] = 0;
      positions[4] = 0;
      positions[5] = 0;
      targetLineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Visual Orbit Track Path */}
      <primitive object={orbitTrackMesh} />

      {/* Laser Downlink Core Beam */}
      {isHovered && (
        <primitive object={customTelemetryLine} ref={targetLineRef} />
      )}

      {/* Satellite Hardware Node Component */}
      <group 
        ref={hardwareGroupRef}
        onPointerOver={(e) => { e.stopPropagation(); onHover(true); }}
        onPointerOut={(e) => { e.stopPropagation(); onHover(false); }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <ArtificialSatelliteGeometry isHovered={isHovered} />

        {/* Pulse Tracking Ring */}
        {isHovered && (
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.15} />
          </mesh>
        )}
      </group>
    </group>
  );
}

export default function TrendsGlobe3D({ stories, hoveredIdx, setHoveredIdx, setActiveIdx }: Trends3DProps) {
  return (
    <div className="w-full h-full relative pointer-events-auto select-none flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 1.2, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="w-full h-full"
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={3} color="#ffffff" />
        <pointLight position={[-4, 2, 4]} intensity={2} color="#06b6d4" />
        
        <Suspense fallback={null}>
          <HologramModel />
          
          {stories.map((_, idx) => (
            <SatelliteHardware
              key={idx}
              index={idx}
              total={stories.length}
              isHovered={hoveredIdx === idx}
              onHover={(hovered) => setHoveredIdx(hovered ? idx : null)}
              onClick={() => setActiveIdx(idx)}
            />
          ))}
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          dampingFactor={0.05}
          rotateSpeed={0.4}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/earth2.glb");