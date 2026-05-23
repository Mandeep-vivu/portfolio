"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  "> Initializing neural interface...",
  "> Loading AI modules...",
  "> Establishing secure connection...",
  "> Calibrating holographic display...",
  "> Welcome, MANDEEP.EXE",
];

export default function LoadingScreen({
  onComplete,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Track timeout IDs so we can clear them on unmount to prevent memory leaks
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const clearAllTimeouts = () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          clearInterval(lineTimer);

          const t1 = setTimeout(() => setVisible(false), 300);
          const t2 = setTimeout(onComplete, 650);
          timeoutsRef.current.push(t1, t2);

          return 100;
        }
        return prev + 2;
      });
    }, 18);

    const lineTimer = setInterval(() => {
      setLineIndex((prev) =>
        Math.min(prev + 1, BOOT_LINES.length - 1)
      );
    }, 240);

    return () => {
      clearInterval(progressTimer);
      clearInterval(lineTimer);
      clearAllTimeouts();
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.01,
          }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[9999] isolate flex items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #030712 0%, #020409 50%, #030712 100%)",
          }}
        >
          {/* Base ambient gradients */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.09) 0%, transparent 35%),
                radial-gradient(circle at 25% 30%, rgba(6, 182, 212, 0.07) 0%, transparent 30%),
                radial-gradient(circle at 75% 70%, rgba(139, 92, 246, 0.06) 0%, transparent 32%)
              `,
              filter: "blur(90px)",
            }}
          />

          {/* Isolated grid */}
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              opacity: 0.03,
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "64px 64px",
              pointerEvents: "none",
            }}
          />

          {/* Scan line */}
          <motion.div
            animate={{
              y: ["-5%", "105%"],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="pointer-events-none absolute left-0 top-0 w-full"
            aria-hidden="true"
            style={{
              height: "6px",
              backgroundImage: "linear-gradient(to bottom, rgba(6, 182, 212, 0) 0%, rgba(6, 182, 212, 0.15) 50%, rgba(6, 182, 212, 0) 100%)",
              zIndex: 2,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex w-full max-w-[440px] flex-col items-center px-6">
            {/* Logo */}
            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.55,
                ease: "easeOut",
              }}
              className="relative mb-7"
            >
              {/* outer glow */}
              <div className="absolute inset-0 rounded-[28px] bg-primary/30 blur-2xl" aria-hidden="true" />

              {/* box */}
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-[26px] border"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01)), rgba(3, 7, 18, 0.6)",
                  boxShadow: "0 0 40px rgba(99, 102, 241, 0.22), 0 8px 32px rgba(0, 0, 0, 0.45)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}>
                <span className="font-display text-3xl font-black tracking-tight text-white">
                  MS
                </span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.12,
                duration: 0.45,
              }}
              className="text-center"
            >
              <h1 className="font-display text-[2.1rem] font-black tracking-[-0.05em] text-white">
                MANDEEP{" "}
                <span className="gradient-text">
                  SINGH
                </span>
              </h1>

              <p className="mt-1.5 font-mono text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">
                AI/ML Engineer · Full Stack Developer
              </p>
            </motion.div>

            {/* Terminal */}
            <motion.div
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
                duration: 0.45,
              }}
              className="mt-7 w-full overflow-hidden rounded-2xl border"
              style={{
                borderColor: "rgba(255, 255, 255, 0.08)",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.005)), rgba(3, 7, 18, 0.5)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              {/* Top bar */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5" aria-hidden="true">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />

                <span className="ml-2 font-mono text-[0.62rem] tracking-[0.14em] text-slate-500">
                  neural_boot_sequence.sh
                </span>
              </div>

              {/* Boot lines */}
              <div className="h-[108px] space-y-1.5 px-4 py-4 font-mono text-[0.72rem] leading-5" role="log" aria-live="polite" aria-label="System initialising">
                {BOOT_LINES.slice(0, lineIndex + 1).map(
                  (line, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.28,
                      }}
                      className={
                        i === lineIndex
                          ? "text-cyan-300"
                          : "text-slate-500"
                      }
                    >
                      {line}

                      {i === lineIndex && (
                        <span className="ml-1 inline-block h-3 w-[7px] animate-pulse bg-cyan-300/90 align-middle" aria-hidden="true" />
                      )}
                    </motion.div>
                  )
                )}
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
                duration: 0.45,
              }}
              className="mt-5 w-full"
            >
              <div className="h-[5px] overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Loading progress">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-cyan-400 to-violet-400"
                  style={{
                    width: `${progress}%`,
                  }}
                  transition={{
                    duration: 0.12,
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between font-mono text-[0.64rem] uppercase tracking-[0.14em] text-slate-500">
                <span>System Initializing</span>
                <span aria-live="polite">{progress}%</span>
              </div>
            </motion.div>
          </div>

          {/* Corner decorations */}
          <div className="absolute left-5 top-5 font-mono text-[0.62rem] tracking-[0.14em] text-primary/30" aria-hidden="true">
            [ SYSTEM_READY ]
          </div>

          <div className="absolute right-5 top-5 font-mono text-[0.62rem] tracking-[0.14em] text-primary/30" aria-hidden="true">
            v3.1.0
          </div>

          <div className="absolute bottom-5 left-5 font-mono text-[0.62rem] tracking-[0.14em] text-primary/20" aria-hidden="true">
            SECURE_CONN : ACTIVE
          </div>

          <div className="absolute bottom-5 right-5 font-mono text-[0.62rem] tracking-[0.14em] text-primary/20" aria-hidden="true">
            NODE_STATUS : ONLINE
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}