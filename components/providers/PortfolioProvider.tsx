"use client";

import { createContext, useContext, type ReactNode } from "react";
import { seedPortfolio } from "@/lib/portfolio/seed";
import type { PortfolioData } from "@/lib/portfolio/types";

const PortfolioContext = createContext<PortfolioData>(seedPortfolio);

export function PortfolioProvider({
  portfolio,
  children,
}: {
  portfolio: PortfolioData;
  children: ReactNode;
}) {
  return (
    <PortfolioContext.Provider value={portfolio}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
