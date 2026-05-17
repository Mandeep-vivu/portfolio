"use client";
import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const raf = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);

      // Update spotlight CSS vars on body
      document.body.style.setProperty("--x", `${e.clientX}px`);
      document.body.style.setProperty("--y", `${e.clientY}px`);
    };

    const loop = () => {
      // Dot snaps instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;
      }
      // Ring follows with lerp
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`;
      }
      raf.current = requestAnimationFrame(loop);
    };

    const onEnter = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, [data-cursor='pointer'], input, textarea")) {
        setIsHovering(true);
      }
    };
    const onLeave = () => setIsHovering(false);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform"
        style={{ width: 8, height: 8 }}
      >
        <div
          className="w-full h-full rounded-full transition-all duration-150"
          style={{
            background: isHovering ? "#06b6d4" : "#6366f1",
            boxShadow: isHovering
              ? "0 0 12px rgba(6,182,212,0.9)"
              : "0 0 8px rgba(99,102,241,0.8)",
            transform: isHovering ? "scale(1.5)" : "scale(1)",
          }}
        />
      </div>
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 z-[9998] pointer-events-none will-change-transform"
        style={{ width: 40, height: 40 }}
      >
        <div
          className="w-full h-full rounded-full border transition-all duration-300"
          style={{
            borderColor: isHovering ? "rgba(6,182,212,0.7)" : "rgba(99,102,241,0.5)",
            transform: isHovering ? "scale(1.6)" : "scale(1)",
            background: isHovering ? "rgba(6,182,212,0.05)" : "transparent",
          }}
        />
      </div>
    </>
  );
}
