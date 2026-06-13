"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedPortfolio } from "@/lib/portfolio/seed";
import type { PortfolioData } from "@/lib/portfolio/types";

const PortfolioContext = createContext<PortfolioData>(seedPortfolio);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [portfolio, setPortfolio] = useState(seedPortfolio);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/portfolio", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: PortfolioData | null) => {
        if (data) setPortfolio(data);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  const value = useMemo(() => portfolio, [portfolio]);

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
