"use client";

import dynamic from "next/dynamic";
import ChatErrorBoundary from "@/components/ai/ChatErrorBoundary";
import { PortfolioProvider } from "@/components/providers/PortfolioProvider";
import About from "@/components/v2/About";
import ContactSection from "@/components/v2/ContactSection";
import Hero from "@/components/v2/Hero";
import Path from "@/components/v2/Path";
import Recognition from "@/components/v2/Recognition";
import SiteFooter from "@/components/v2/SiteFooter";
import SiteHeader from "@/components/v2/SiteHeader";
import Skills from "@/components/v2/Skills";
import Work from "@/components/v2/Work";
import type { PortfolioData } from "@/lib/portfolio/types";

const AIChat = dynamic(() => import("@/components/ai/AIChat"), { ssr: false });

export default function HomeClient({ portfolio }: { portfolio: PortfolioData }) {
  return (
    <PortfolioProvider portfolio={portfolio}>
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
      {/* The assistant keeps its own dark panel; its text colours inherit from here. */}
      <div className="dark text-white">
        <ChatErrorBoundary>
          <AIChat />
        </ChatErrorBoundary>
      </div>
    </PortfolioProvider>
  );
}
