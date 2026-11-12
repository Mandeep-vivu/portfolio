import type { ReactNode } from "react";

/** Page-width container shared by every section. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[76rem] px-5 sm:px-8 lg:px-10 ${className}`}>{children}</div>;
}

/** A titled page section, separated from the previous one by a rule. */
export function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-ink/15">
      <Container className="py-16 sm:py-24">
        <header className="mb-10 grid gap-3 sm:mb-14 lg:grid-cols-12 lg:gap-8">
          <h2
            id={`${id}-title`}
            className="t-wide text-[1.9rem] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[2.6rem] lg:col-span-5"
          >
            {title}
          </h2>
          {lead && <p className="max-w-[58ch] text-quiet lg:col-span-7 lg:pt-2">{lead}</p>}
        </header>
        {children}
      </Container>
    </section>
  );
}

const linkBase =
  "inline-flex items-center justify-center gap-2 rounded-[6px] px-5 py-3 text-[0.95rem] font-semibold leading-none transition-colors";

export const buttonStyles = {
  primary: `${linkBase} bg-ink text-white hover:bg-cobalt`,
  secondary: `${linkBase} border border-ink/25 text-ink hover:border-ink hover:bg-sheet`,
  onInk: `${linkBase} bg-white text-ink hover:bg-amber`,
};

/** Underlined text link used inside copy and lists. */
export const textLink =
  "font-semibold text-ink underline decoration-cobalt decoration-2 underline-offset-4 hover:text-cobalt";
