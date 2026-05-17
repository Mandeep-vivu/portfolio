import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mandeep Singh — AI/ML Engineer & Full Stack Developer",
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
    locale: "en_US",
    title: "Mandeep Singh — AI/ML Engineer & Full Stack Developer",
    description:
      "Futuristic portfolio of Mandeep Singh — AI/ML Engineer, Data Scientist & Full Stack Developer.",
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

export const viewport: Viewport = {
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="dark bg-background text-white antialiased">
        {children}
      </body>
    </html>
  );
}
