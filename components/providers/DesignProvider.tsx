"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import {
  DESIGN_COOKIE,
  DESIGN_COOKIE_MAX_AGE,
  THEME_COLOR,
  equivalentSection,
  isTopSection,
  otherDesign,
  type Design,
} from "@/lib/design";

type DesignContextValue = {
  design: Design;
  /** True once the visitor has switched at least once on this page view. */
  hasSwitched: boolean;
  switchDesign: () => void;
};

const DesignContext = createContext<DesignContextValue | null>(null);

/** The section the visitor is reading: the last one whose top has passed 30% of the viewport. */
function sectionInView(): string | null {
  const marker = window.innerHeight * 0.3;
  let current: string | null = null;
  for (const section of document.querySelectorAll<HTMLElement>("main section[id]")) {
    if (section.getBoundingClientRect().top <= marker) current = section.id;
  }
  return current;
}

function rememberDesign(design: Design) {
  document.cookie = `${DESIGN_COOKIE}=${design}; path=/; max-age=${DESIGN_COOKIE_MAX_AGE}; samesite=lax`;
  // The root layout renders this attribute from the cookie; keep it in step
  // without a server round trip. Global styles are scoped by it.
  document.documentElement.dataset.design = design;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[design]);
}

export function DesignProvider({
  initialDesign,
  children,
}: {
  initialDesign: Design;
  children: ReactNode;
}) {
  const [design, setDesign] = useState(initialDesign);
  const [hasSwitched, setHasSwitched] = useState(false);

  const switchDesign = useCallback(() => {
    const next = otherDesign(design);
    const reading = sectionInView();
    const target = reading ? equivalentSection(reading, design, next) : null;

    const update = () => {
      rememberDesign(next);
      flushSync(() => {
        setDesign(next);
        setHasSwitched(true);
      });

      // Land on the same section in the new layout.
      const element = target && !isTopSection(target) ? document.getElementById(target) : null;
      if (element) element.scrollIntoView({ block: "start", behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && typeof document.startViewTransition === "function") {
      document.startViewTransition(update);
    } else {
      update();
    }
  }, [design]);

  const value = useMemo(() => ({ design, hasSwitched, switchDesign }), [design, hasSwitched, switchDesign]);

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign(): DesignContextValue {
  const context = useContext(DesignContext);
  if (!context) throw new Error("useDesign must be used inside DesignProvider");
  return context;
}
