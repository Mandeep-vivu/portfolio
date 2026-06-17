"use client";
import React, { useRef, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

function OrbMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.12;
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group>
        {/* Core orb */}
        <Sphere ref={meshRef} args={[1.6, 128, 128]}>
          <MeshDistortMaterial
            color="#4f46e5"
            attach="material"
            distort={0.45}
            speed={2.5}
            roughness={0.05}
            metalness={0.9}
            emissive="#6366f1"
            emissiveIntensity={0.3}
          />
        </Sphere>

        {/* Outer halo ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0.3, 0]}>
          <torusGeometry args={[2.5, 0.015, 16, 100]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
        </mesh>

        {/* Orbit particles */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 2.2;
          const z = Math.sin(angle) * 2.2;
          return (
            <mesh key={i} position={[x, 0, z]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshBasicMaterial color="#06b6d4" />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

// Class-based Error Boundary to catch runtime WebGL failures
class WebGLErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn("WebGL Canvas failed to render, falling back to CSS Orb:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function isWebGLAvailable() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

export default function AIOrb() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  const fallbackOrb = (
    <div className="relative flex items-center justify-center w-full h-full min-h-[300px]">
      {/* Animated glowing fallback orb using vanilla CSS */}
      <div className="absolute h-48 w-48 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 opacity-60 blur-3xl animate-pulse" />
      <div className="relative h-36 w-36 rounded-full border border-indigo-400/30 bg-gradient-to-tr from-indigo-600/20 to-cyan-400/20 backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.25)] transition-all duration-500 hover:border-primary/40">
        <div className="absolute h-28 w-28 rounded-full border border-cyan-400/40 animate-ping [animation-duration:3s]" />
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 blur-[2px] opacity-80 animate-pulse" />
      </div>
    </div>
  );

  if (hasWebGL === null) {
    return <div className="w-full h-full min-h-[300px]" />;
  }

  if (!hasWebGL) {
    return fallbackOrb;
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      <WebGLErrorBoundary fallback={fallbackOrb}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.2} />
            <pointLight position={[-3, 3, 3]} color="#6366f1" intensity={8} distance={10} />
            <pointLight position={[3, -2, 2]} color="#06b6d4" intensity={6} distance={10} />
            <pointLight position={[0, 3, -3]} color="#8b5cf6" intensity={5} distance={10} />
            <OrbMesh />
            <Environment preset="night" />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
