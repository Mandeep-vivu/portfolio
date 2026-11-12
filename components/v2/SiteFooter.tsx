"use client";

import { usePortfolio } from "@/components/providers/PortfolioProvider";
import { Container } from "./Shell";

export default function SiteFooter() {
  const { profile } = usePortfolio();

  return (
    <footer className="border-t border-white/15 bg-ink text-white/60">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-6 text-[0.92rem]">
        <p className="m-0">
          © {new Date().getFullYear()} {profile.name}
        </p>
        <a href="#top" className="font-medium text-white/80 hover:text-white">
          Back to top
        </a>
      </Container>
    </footer>
  );
}
