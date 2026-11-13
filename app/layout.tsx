import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import CalendlyBadge from "@/components/CalendlyBadge";
import { THEME_COLOR } from "@/lib/design";
import { getDesign } from "@/lib/design-server";
import { SITE_URL } from "@/lib/site";

// All fonts are self-hosted (SIL Open Font License, see app/fonts/OFL-*.txt)
// so builds do not depend on Google Fonts. Browsers only download the files
// the active design uses; the dark design's fonts are not preloaded because
// most visitors start on the light one.
const archivo = localFont({
  src: "./fonts/archivo-latin-variable.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});

const inter = localFont({
  src: "./fonts/inter-latin-variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
  preload: false,
});

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin-variable.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
  preload: false,
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin-variable.woff2",
  variable: "--font-jetbrains-mono",
  weight: "100 800",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  title: {
    default: "Mandeep Singh — AI/ML Engineer & Full Stack Developer",
    template: "%s · Mandeep Singh",
  },
  description:
    "Portfolio of Mandeep Singh — AI/ML Engineer specializing in Machine Learning, Python, Cloud, Full Stack Development, and emerging technologies. Pursuing M.E. in AI & ML at Chandigarh University.",
  keywords: [
    "Mandeep Singh",
    "AI Engineer",
    "ML Engineer",
    "Full Stack Developer",
    "Machine Learning",
    "Python",
    "Next.js",
    "Flutter",
    "Data Science",
    "Portfolio",
    "Chandigarh University",
  ],
  authors: [{ name: "Mandeep Singh", url: "https://github.com/Mandeep-vivu" }],
  creator: "Mandeep Singh",
  openGraph: {
    type: "website",
    url: "/",
    locale: "en_US",
    title: "Mandeep Singh — AI/ML Engineer & Full Stack Developer",
    description:
      "Portfolio of Mandeep Singh, an AI/ML engineer working on graph networks for power-grid faults and deep learning for ECG diagnosis.",
    siteName: "Mandeep Singh Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mandeep Singh — AI/ML Engineer",
    description: "AI/ML Engineer & Full Stack Developer — Portfolio",
    creator: "@vivu___7",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export async function generateViewport(): Promise<Viewport> {
  return { themeColor: THEME_COLOR[await getDesign()] };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-design={await getDesign()}
      className={`${archivo.variable} ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <CalendlyBadge />
      </body>
    </html>
  );
}
