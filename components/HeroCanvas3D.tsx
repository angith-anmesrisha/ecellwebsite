"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function LocalGlbModel() {
  const { scene, animations } = useGLTF("/hero-mesh.glb");
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  
  const clone = useMemo(() => scene.clone(true), [scene]);

  
  useEffect(() => {
    if (clone && animations && animations.length > 0) {
      
      const mixer = new THREE.AnimationMixer(clone);
      mixerRef.current = mixer;

      
      const action = mixer.clipAction(animations[0]);
      action.setLoop(THREE.LoopRepeat, Infinity); 
      action.clampWhenFinished = false;
      action.play(); 
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [clone, animations]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const scrollFactor = Math.min(scrollY / 700, 1);
    const { x, y } = state.pointer;

    
    groupRef.current.position.x = (x * 0.4);
    groupRef.current.position.y = (y * 0.4);
    groupRef.current.position.z = (scrollFactor * -2);

    
    
    const baseRotationY = 0.5; 
    groupRef.current.rotation.y = baseRotationY + (x * 0.1);
    groupRef.current.rotation.x = 0; 

    
    
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={clone} scale={1.8} />
    </group>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} color="#3b82f6" />
      <directionalLight position={[-5, -5, -5]} intensity={1.2} color="#ec4899" />
      <pointLight position={[0, 0, 3]} intensity={2.0} color="#a855f7" />
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
          <LocalGlbModel />
        </Center>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/hero-mesh.glb");