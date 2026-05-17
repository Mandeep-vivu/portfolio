"use client";
import { useRef, Suspense } from "react";
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

export default function AIOrb() {
  return (
    <div className="w-full h-full">
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
    </div>
  );
}
