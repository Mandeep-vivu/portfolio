"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

// Layout
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/layout/CustomCursor";

// Sections
import LoadingScreen from "@/components/sections/LoadingScreen";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Timeline from "@/components/sections/Timeline";
import Achievements from "@/components/sections/Achievements";
import Contact from "@/components/sections/Contact";

// Particles (client-only, SSR=false)
const ParticleField = dynamic(() => import("@/components/three/ParticleField"), { ssr: false });

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      <div className="relative min-h-screen">
          {/* Animated background grid */}
          <div className="grid-bg" aria-hidden />

          {/* Floating particle field */}
          <ParticleField count={50} />

          {/* Custom cursor */}
          <CustomCursor />

          {/* Navigation */}
          <Navbar />

          {/* Main content */}
          <main className="relative z-10">
            <Hero isLoading={!loaded} />
            <About />
            <Skills />
            <Projects />
            <Timeline />
            <Achievements />
            <Contact />
          </main>

          <Footer />
      </div>
    </>
  );
}
