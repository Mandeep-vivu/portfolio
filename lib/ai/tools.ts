// @ts-nocheck
import "server-only";

import { tool } from "ai";
import { z } from "zod";
import { getPortfolio } from "@/lib/portfolio/repository";

export const ResumeTool = tool({
  description: "Return Mandeep's resume download link. Use this tool when the user asks for resume or CV.",
  parameters: z.object({}),
  execute: async (_args: any): Promise<any> => {
    const portfolio = await getPortfolio();
    if (!portfolio.profile.resumeUrl) {
      return { type: "error", content: "Resume not found" };
    }
    return { 
      type: "resume_link",
      url: portfolio.profile.resumeUrl, 
      title: `${portfolio.profile.name} - Resume`
    };
  },
});

export const ProjectTool = tool({
  description: "Render project cards from retrieved RAG data. IMPORTANT: Pass the project data that was retrieved from the database to format it into UI cards. Do not use this tool for searching.",
  parameters: z.object({
    projects: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      tech: z.array(z.string()),
      github: z.string().optional(),
      demo: z.string().optional(),
    }))
  }),
  execute: async (args: any): Promise<any> => {
    return { 
      type: "project_card",
      projects: args.projects 
    };
  },
});

export const ContactTool = tool({
  description: "Return Mandeep's verified contact information. Use when the user wants to reach out or connect.",
  parameters: z.object({}),
  execute: async (_args: any): Promise<any> => {
    const portfolio = await getPortfolio();
    return {
      type: "contact",
      email: portfolio.contact.email,
      phone: portfolio.contact.phone,
      linkedin: portfolio.contact.linkedin,
      github: portfolio.contact.github,
      portfolioUrl: portfolio.contact.portfolioUrl || process.env.NEXT_PUBLIC_SITE_URL || "",
    };
  },
});

export const SchedulingTool = tool({
  description: "Return the Calendly booking option. Use when the user wants to schedule a call or meeting.",
  parameters: z.object({}),
  execute: async (_args: any): Promise<any> => {
    const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "";
    if (!calendlyUrl) {
      return { type: "error", content: "Scheduling is not configured yet." };
    }
    return { 
      type: "schedule",
      url: calendlyUrl,
    };
  },
});
