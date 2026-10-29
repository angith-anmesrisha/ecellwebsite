"use client";

import { useEffect, useRef, useState } from "react";

interface HeroHeadProps {
  animate: boolean;
  small: boolean;
  className?: string;
}

// The animated 3D head from the original hero, lit to sit in front of the black hole:
// a warm rim from the accretion disk behind it and a cool nebula fill from the front.
// three.js and the model are only fetched once the page is idle, so they never hold up first paint.
export default function HeroHead({ animate, small, className = "absolute inset-0 w-full h-full" }: HeroHeadProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    const start = async () => {
      const [THREE, { GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/loaders/GLTFLoader.js"),
        import("three/examples/jsm/libs/meshopt_decoder.module.js"),
      ]);
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !small, powerPreference: "high-performance" });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      const canvas = renderer.domElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.setAttribute("aria-hidden", "true");
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
      camera.position.set(0, 0, 9);

      // Tiny gradient sky (gold below/behind, indigo above) for the metal to reflect
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envScene = new THREE.Scene();
      envScene.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(5, 32, 16),
          new THREE.ShaderMaterial({
            side: THREE.BackSide,
            vertexShader: `varying vec3 vDir; void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `varying vec3 vDir; void main() {
              float up = vDir.y * 0.5 + 0.5;
              vec3 gold = vec3(1.0, 0.55, 0.15) * 2.2;
              vec3 blue = vec3(0.25, 0.3, 0.95) * 1.2;
              vec3 c = mix(gold, blue, smoothstep(0.25, 0.75, up));
              c *= mix(0.15, 1.0, smoothstep(-0.2, 0.9, -vDir.z));
              gl_FragColor = vec4(c, 1.0);
            }`,
          }),
        ),
      );
      const envMap = pmrem.fromScene(envScene, 0.04).texture;
      scene.environment = envMap;
      scene.environmentIntensity = 0.55;

      scene.add(new THREE.AmbientLight(0x312e81, 0.8));
      const key = new THREE.DirectionalLight(0xc7d2fe, 2.6);
      key.position.set(-5, 2.5, 5);
      const rim = new THREE.DirectionalLight(0xfbbf24, 5);
      rim.position.set(3, 1, -6);
      const rim2 = new THREE.DirectionalLight(0xf59e0b, 3);
      rim2.position.set(-3, -2, -5);
      const glow = new THREE.PointLight(0xfcd34d, 6, 12, 1.5);
      glow.position.set(0, -2.2, 1.5);
      scene.add(key, rim, rim2, glow);

      const group = new THREE.Group();
      scene.add(group);

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      let mixer: InstanceType<typeof THREE.AnimationMixer> | null = null;
      try {
        const gltf = await loader.loadAsync("/hero-head.glb");
        if (disposed) {
          pmrem.dispose();
          renderer.dispose();
          canvas.remove();
          return;
        }
        const model = gltf.scene;
        model.traverse((o) => {
          const mesh = o as InstanceType<typeof THREE.Mesh>;
          if (!mesh.isMesh) return;
          const mat = mesh.material as InstanceType<typeof THREE.MeshStandardMaterial>;
          if (mat.name === "eyes") {
            mat.color.set(0xfde68a);
            mat.emissive = new THREE.Color(0xf59e0b);
            mat.emissiveIntensity = 0.6;
            mat.metalness = 0.2;
            mat.roughness = 0.3;
          } else {
            mat.color.set(0x2a2638);
            mat.metalness = 0.75;
            mat.roughness = 0.36;
          }
        });
        // Centre and size on the head itself: three's own bounds include every morph
        // target, and the particles drifting off the back of the head would dominate them
        model.updateMatrixWorld(true);
        const box = new THREE.Box3();
        model.traverse((o) => {
          const mesh = o as InstanceType<typeof THREE.Mesh>;
          if (mesh.isMesh && mesh.morphTargetInfluences?.length) {
            box.union(new THREE.Box3().setFromBufferAttribute(mesh.geometry.attributes.position as InstanceType<typeof THREE.BufferAttribute>).applyMatrix4(mesh.matrixWorld));
          }
        });
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const fit = new THREE.Group();
        fit.add(model);
        // Mirrored so the face looks back toward the headline and the particles stream
        // off to the right, into the black hole
        fit.scale.set(-5 / size.y, 5 / size.y, 5 / size.y);
        group.add(fit);
        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model);
          mixer.clipAction(gltf.animations[0]).play();
        }
      } catch {
        pmrem.dispose();
        renderer.dispose();
        canvas.remove();
        return;
      }

      const resize = () => {
        const w = host.clientWidth, h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      // Desktop follows the pointer; touch screens get a slow idle sway instead
      const pointer = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      const clock = new THREE.Clock();
      let raf = 0;
      let visible = true;
      const baseYaw = -0.5;
      const frame = () => {
        const dt = Math.min(clock.getDelta(), 0.1);
        const t = clock.elapsedTime;
        const sway = small ? Math.sin(t * 0.4) * 0.25 : 0;
        group.rotation.y += (baseYaw + pointer.x * 0.3 + sway - group.rotation.y) * 0.05;
        group.rotation.x += (pointer.y * 0.12 - group.rotation.x) * 0.05;
        group.position.y = Math.sin(t * 0.8) * 0.06;
        mixer?.update(dt);
        renderer.render(scene, camera);
        if (animate && visible && !document.hidden) raf = requestAnimationFrame(frame);
      };
      group.rotation.y = baseYaw;
      mixer?.update(animate ? 0 : 3);
      frame();
      setReady(true);

      const resume = () => {
        cancelAnimationFrame(raf);
        clock.getDelta();
        if (animate && visible && !document.hidden) raf = requestAnimationFrame(frame);
      };
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        resume();
      });
      io.observe(host);
      document.addEventListener("visibilitychange", resume);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", resume);
        window.removeEventListener("pointermove", onPointer);
        scene.traverse((o) => {
          const mesh = o as InstanceType<typeof THREE.Mesh>;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          (mesh.material as InstanceType<typeof THREE.Material>).dispose();
        });
        envMap.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      };
    };

    // Wait for the page to settle before pulling in three.js and the model
    const idle = "requestIdleCallback" in window;
    const timer = idle ? window.requestIdleCallback(() => void start(), { timeout: 2000 }) : window.setTimeout(() => void start(), 600);

    return () => {
      disposed = true;
      if (idle) window.cancelIdleCallback(timer);
      else window.clearTimeout(timer);
      cleanup();
    };
  }, [animate, small]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`${className} transition-opacity duration-[1500ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}
    />
  );
}
