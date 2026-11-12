import "server-only";

import type { PortfolioData } from "@/lib/portfolio/types";
import type { Block } from "./schemas";
import type { LocalIntent } from "./intents";
import { hasMatches, retrieveHybridContext, type HybridRetrievalContext } from "./hybrid";

export const BUSY_MESSAGE =
  "The AI assistant is temporarily busy. Please try again in a few minutes.";

export function calculateAge(birthDate: string, asOf = new Date()): number | null {
  const born = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(born.getTime())) return null;

  let age = asOf.getFullYear() - born.getFullYear();
  const hadBirthdayThisYear =
    asOf.getMonth() > born.getMonth() ||
    (asOf.getMonth() === born.getMonth() && asOf.getDate() >= born.getDate());

  if (!hadBirthdayThisYear) age -= 1;
  return age;
}

function formatBirthDate(birthDate: string) {
  const born = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(born.getTime())) return birthDate;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(born);
}

function bulletList(entries: Array<{ title: string; description?: string }>) {
  return entries
    .map((entry) => `- ${entry.title}${entry.description ? `: ${entry.description}` : ""}`)
    .join("\n");
}

/**
 * Turns retrieved portfolio context into chat blocks without an LLM. Used for
 * FAQ-style questions and as the fallback when every model provider fails.
 */
export function blocksFromContext(
  context: HybridRetrievalContext,
  intro = "Based on Mandeep's portfolio:",
): Block[] {
  if (!hasMatches(context)) return [];

  const sections: string[] = [];
  if (context.semanticMatches.length > 0) {
    sections.push(
      context.semanticMatches.map((match) => `**${match.title}**: ${match.content}`).join("\n\n"),
    );
  }
  if (context.matchedSkills.length > 0) {
    sections.push(`Skills: ${context.matchedSkills.map((skill) => skill.name).join(", ")}`);
  }
  if (context.matchedExperience.length > 0) {
    sections.push(
      `Experience:\n${context.matchedExperience.map((entry) => `- **${entry.title}** at ${entry.org}`).join("\n")}`,
    );
  }
  const recognition = [...context.matchedCertifications, ...context.matchedAchievements];
  if (recognition.length > 0) {
    sections.push(`Certifications & achievements:\n${bulletList(recognition)}`);
  }

  const blocks: Block[] = [];
  if (sections.length > 0) {
    blocks.push({ type: "text", content: `${intro}\n\n${sections.join("\n\n")}` });
  }
  if (context.matchedProjects.length > 0) {
    blocks.push({ type: "project_card", projects: context.matchedProjects });
  }
  return blocks;
}

/** Answers a locally routed intent straight from portfolio data. */
export async function answerLocalIntent(
  intent: LocalIntent,
  message: string,
  portfolio: PortfolioData,
): Promise<Block[]> {
  const { profile, contact, certifications } = portfolio;

  switch (intent) {
    case "GREETING":
      return [
        {
          type: "text",
          content:
            "Hello! I'm Mandeep AI. I can help you explore Mandeep's portfolio, skills, and projects. What would you like to know?",
        },
      ];

    case "RESUME_REQUEST":
      return profile.resumeUrl
        ? [{ type: "resume_link", url: profile.resumeUrl, title: `${profile.name} - Resume` }]
        : [{ type: "text", content: "The resume isn't available right now." }];

    case "PROFILE_AGE_REQUEST": {
      const age = profile.birthDate ? calculateAge(profile.birthDate) : null;
      return [
        {
          type: "text",
          content:
            profile.birthDate && age !== null
              ? `Mandeep was born on ${formatBirthDate(profile.birthDate)}. He is currently ${age} years old.`
              : "Mandeep's date of birth is not available in the portfolio data.",
        },
      ];
    }

    case "PROFILE_HOBBIES_REQUEST": {
      const hobbies = profile.hobbies ?? [];
      return [
        {
          type: "text",
          content:
            hobbies.length > 0
              ? `Mandeep's hobbies and interests include ${hobbies.map((hobby) => hobby.toLowerCase()).join(", ")}.`
              : "Mandeep's hobbies are not available in the portfolio data.",
        },
      ];
    }

    case "SCHEDULING_REQUEST": {
      const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "";
      return calendlyUrl
        ? [{ type: "schedule", url: calendlyUrl }]
        : [{ type: "error", content: "Scheduling is not configured yet." }];
    }

    case "CONTACT_REQUEST":
      return [
        {
          type: "contact",
          email: contact.email,
          phone: contact.phone,
          linkedin: contact.linkedin,
          github: contact.github,
          portfolioUrl: contact.portfolioUrl || process.env.NEXT_PUBLIC_SITE_URL || "",
        },
      ];

    case "CERTIFICATION_REQUEST": {
      const entries = certifications.filter((entry) => entry.type === "certification");
      return [
        {
          type: "text",
          content:
            entries.length > 0
              ? `Mandeep has ${entries.length} certifications:\n\n${bulletList(entries)}`
              : "No certifications were found in the portfolio.",
        },
      ];
    }

    case "ACHIEVEMENT_REQUEST": {
      const entries = certifications.filter((entry) => entry.type !== "certification");
      return [
        {
          type: "text",
          content:
            entries.length > 0
              ? `Mandeep's recognition includes ${entries.length} achievements and honors:\n\n${bulletList(entries)}`
              : "No achievement records were found in the portfolio.",
        },
      ];
    }

    case "FAQ_REQUEST": {
      const blocks = blocksFromContext(await retrieveHybridContext(message, portfolio, 4));
      return blocks.length > 0
        ? blocks
        : [
            {
              type: "text",
              content: "I couldn't find specific information about that in the portfolio.",
            },
          ];
    }
  }
}
