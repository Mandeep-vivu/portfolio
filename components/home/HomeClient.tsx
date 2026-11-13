"use client";

import dynamic from "next/dynamic";
import ChatErrorBoundary from "@/components/ai/ChatErrorBoundary";
import { DesignProvider, useDesign } from "@/components/providers/DesignProvider";
import { PortfolioProvider } from "@/components/providers/PortfolioProvider";
import HomeV1 from "@/components/v1/HomeV1";
import HomeV2 from "@/components/v2/HomeV2";
import type { Design } from "@/lib/design";
import type { PortfolioData } from "@/lib/portfolio/types";

const AIChat = dynamic(() => import("@/components/ai/AIChat"), { ssr: false });

function CurrentDesign() {
  const { design } = useDesign();
  return design === "dark" ? <HomeV1 /> : <HomeV2 />;
}

export default function HomeClient({
  portfolio,
  initialDesign,
}: {
  portfolio: PortfolioData;
  initialDesign: Design;
}) {
  return (
    <PortfolioProvider portfolio={portfolio}>
      <DesignProvider initialDesign={initialDesign}>
        <CurrentDesign />
        {/* Shared by both designs, so a conversation survives a switch. */}
        <div className="dark text-white">
          <ChatErrorBoundary>
            <AIChat />
          </ChatErrorBoundary>
        </div>
      </DesignProvider>
    </PortfolioProvider>
  );
}
