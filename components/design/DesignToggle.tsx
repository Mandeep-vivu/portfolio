"use client";

import { Moon, Sun } from "lucide-react";
import { useDesign } from "@/components/providers/DesignProvider";

/**
 * Switches between the two site designs, like a light/dark mode button. It
 * shows where it will take you: a moon in the light design, a sun in the
 * dark one. Each design's header passes its own styling.
 */
export default function DesignToggle({ className = "" }: { className?: string }) {
  const { design, switchDesign } = useDesign();
  const label = design === "light" ? "Switch to the dark design" : "Switch to the light design";
  const Icon = design === "light" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={switchDesign}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center transition-colors ${className}`}
    >
      <Icon size={18} aria-hidden />
    </button>
  );
}
