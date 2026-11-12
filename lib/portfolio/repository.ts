import "server-only";

import { seedPortfolio } from "@/lib/portfolio/seed";
import { portfolioSchema, sectionSchemas, type ContentSection } from "./schemas";
import type { PortfolioData } from "./types";

const CONTENT_KEY = "portfolio:content:v1";
let memoryPortfolio: PortfolioData | null = null;

function upstashConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

async function upstashCommand(command: unknown[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Content store request failed with ${response.status}`);
  }

  return (await response.json()) as { result?: unknown };
}

export async function getPortfolio(): Promise<PortfolioData> {
  if (upstashConfigured()) {
    // The public site renders from this call, so a storage outage or corrupt
    // record must degrade to the bundled content rather than a 500.
    try {
      const response = await upstashCommand(["GET", CONTENT_KEY]);
      if (typeof response?.result === "string") {
        const parsed = portfolioSchema.safeParse(JSON.parse(response.result));
        if (parsed.success) return parsed.data;
        console.error("Stored portfolio content failed validation:", parsed.error.issues);
      }
    } catch (error) {
      console.error("Unable to read stored portfolio content:", error);
    }
  }

  return memoryPortfolio ?? seedPortfolio;
}

export async function savePortfolio(portfolio: PortfolioData) {
  const validated = portfolioSchema.parse(portfolio);

  if (upstashConfigured()) {
    await upstashCommand(["SET", CONTENT_KEY, JSON.stringify(validated)]);
  } else if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Persistent content storage is not configured. Add Upstash Redis environment variables.",
    );
  } else {
    memoryPortfolio = validated;
  }

  return validated;
}

export async function updatePortfolioSection(
  section: ContentSection,
  value: unknown,
) {
  const portfolio = await getPortfolio();
  const validated = sectionSchemas[section].parse(value);
  const next = { ...portfolio, [section]: validated } as PortfolioData;
  return savePortfolio(next);
}

export function getContentStorageMode() {
  if (upstashConfigured()) return "upstash";
  if (process.env.NODE_ENV === "production") return "readonly";
  return "memory";
}
