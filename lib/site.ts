import contact from "@/data/portfolio/contact.json";

/**
 * Canonical site origin, without a trailing slash. Set NEXT_PUBLIC_SITE_URL
 * per environment; the portfolio's published URL is the fallback.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  contact.portfolioUrl.replace(/^http:/, "https:") ||
  "http://localhost:3000"
).replace(/\/+$/, "");
