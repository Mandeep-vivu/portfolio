"use client";

import { Download } from "lucide-react";
import { usePortfolio } from "@/components/providers/PortfolioProvider";
import { safeHref } from "@/lib/url";
import AskBar from "./AskBar";
import { Container, buttonStyles } from "./Shell";
import SignalTrace from "./SignalTrace";

export default function Hero() {
  const { profile } = usePortfolio();
  const resume = safeHref(profile.resumeUrl, { webOnly: true });

  return (
    <section id="top" aria-labelledby="hero-title" className="overflow-hidden">
      <Container className="pb-8 pt-12 sm:pt-20">
        {profile.availableForWork && (
          <p className="mb-6 flex items-center gap-2.5 text-[0.95rem] font-medium text-quiet">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-cobalt" />
            Open to AI/ML roles and internships
          </p>
        )}
        <h1
          id="hero-title"
          className="t-wide max-w-[17ch] text-[2.45rem] font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-[4rem] lg:text-[5.4rem]"
        >
          I build models that find the fault in the signal.
        </h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className="max-w-[56ch] text-[1.1rem] leading-[1.6] text-quiet lg:col-span-7">
            I&apos;m {profile.name}, an AI/ML engineer doing my M.E. at Chandigarh University. My
            research uses graph attention networks to locate power-grid faults and deep learning to
            read ECGs. I also build the Flutter and Next.js apps around the models.
          </p>
          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            {resume && (
              <a href={resume} target="_blank" rel="noopener noreferrer" className={buttonStyles.primary}>
                <Download size={16} aria-hidden />
                Download résumé
              </a>
            )}
            <a href="#contact" className={buttonStyles.secondary}>
              Get in touch
            </a>
          </div>
        </div>
      </Container>

      <SignalTrace />

      <Container className="pb-16 pt-6 sm:pb-24">
        <div className="max-w-[44rem]">
          <AskBar />
        </div>
      </Container>
    </section>
  );
}
