"use client";

import About from "./About";
import ContactSection from "./ContactSection";
import Hero from "./Hero";
import Path from "./Path";
import Recognition from "./Recognition";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import Skills from "./Skills";
import Work from "./Work";

/** Version 2: the light, typographic design. */
export default function HomeV2() {
  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[6px] focus:bg-ink focus:px-4 focus:py-3 focus:text-white"
      >
        Skip to work
      </a>
      <SiteHeader />
      <main>
        <Hero />
        <Work />
        <About />
        <Skills />
        <Path />
        <Recognition />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
