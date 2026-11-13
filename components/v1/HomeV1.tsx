"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useDesign } from "@/components/providers/DesignProvider";
import CustomCursor from "./layout/CustomCursor";
import Footer from "./layout/Footer";
import Navbar from "./layout/Navbar";
import About from "./sections/About";
import Achievements from "./sections/Achievements";
import Contact from "./sections/Contact";
import Hero from "./sections/Hero";
import LoadingScreen from "./sections/LoadingScreen";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import Timeline from "./sections/Timeline";

// WebGL particles are client-only.
const ParticleField = dynamic(() => import("./three/ParticleField"), { ssr: false });

/** Version 1: the dark, animated design. */
export default function HomeV1() {
  const { hasSwitched } = useDesign();
  // The boot sequence plays on a fresh visit, not when switching designs.
  const [loaded, setLoaded] = useState(hasSwitched);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      <div className="relative min-h-screen" style={{ position: "relative", zIndex: 1 }}>
        <div className="grid-bg" aria-hidden />
        <ParticleField count={50} />
        <CustomCursor />
        <Navbar />

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
