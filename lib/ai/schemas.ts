import { z } from "zod";
import { projectSchema } from "@/lib/portfolio/schemas";

// ---------------------------------------------------------------------------
// Chat message schemas
// ---------------------------------------------------------------------------

export const chatMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(["system", "user", "assistant", "function", "data", "tool"]),
  content: z.string().optional().default(""),
}).passthrough();

export const conversationMemorySchema = z.object({
  activeTopic: z.string().nullable().describe("The current topic of conversation, if any."),
  lastProjects: z.array(z.string()).describe("List of recent project IDs or titles discussed in chronological order."),
  lastSkills: z.array(z.string()).describe("List of recent skills discussed."),
  lastEntities: z.array(z.string()).describe("Other significant entities recently mentioned (e.g. universities, companies)."),
  recentMessages: z.array(z.object({
    role: z.string(),
    content: z.string()
  })).describe("Brief summaries or raw content of the most recent interactions."),
});

export type ConversationMemory = z.infer<typeof conversationMemorySchema>;

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(50),
  memory: conversationMemorySchema.nullable().optional(),
});

export const singleTurnResponseSchema = z.object({
  intent: z.string().describe("The intent of the user's query (e.g., PROJECT_SEARCH, COMPARISON, RECOMMENDATION, GREETING)."),
  confidence: z.number().describe("Confidence score from 0.0 to 1.0."),
  needsClarification: z.boolean().describe("True if the user's query is vague and needs clarification."),
  clarificationQuestion: z.string().optional().describe("The professional clarification question to ask if needed."),
  response: z.string().describe("The comprehensive, grounded response based strictly on the portfolio context. Explain your comparison, recommendation, or reasoning clearly here."),
  referencedEntities: z.array(z.string()).describe("List of explicit or implicitly referenced entities resolved from memory."),
  activeTopic: z.string().describe("The active topic of conversation."),
});

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), content: z.string() }),
  z.object({
    type: z.literal("project_card"),
    projects: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      tech: z.array(z.string()),
      github: z.string().optional(),
      demo: z.string().optional(),
    })),
  }),
  z.object({
    type: z.literal("resume_link"),
    url: z.string().url(),
    title: z.string(),
  }),
  z.object({
    type: z.literal("contact"),
    email: z.string().email(),
    phone: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portfolioUrl: z.string().optional(),
  }),
  z.object({
    type: z.literal("schedule"),
    url: z.string().url(),
  }),
  z.object({ type: z.literal("error"), content: z.string() }),
]);

export type Block = z.infer<typeof blockSchema>;

export const finalResponseSchema = z.object({
  blocks: z.array(blockSchema).min(1).describe("An array of structural blocks. Use text blocks for conversational responses and dedicated blocks (project, resume, contact) to present structured data. Never output an empty blocks array."),
});



// ---------------------------------------------------------------------------
// Result schemas
// ---------------------------------------------------------------------------

export const projectResultSchema = projectSchema.pick({
  id: true,
  title: true,
  description: true,
  tech: true,
  github: true,
  demo: true,
});

const skillEntrySchema = z.object({
  name: z.string(),
  level: z.number(),
  category: z.string(),
  color: z.string(),
});

const timelineEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  org: z.string(),
  year: z.string(),
  description: z.string(),
});

const experienceEntrySchema = timelineEntrySchema.extend({
  type: z.string(),
});

const achievementEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  link: z.string().optional(),
});

export const agentResultSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({
    type: z.literal("projects"),
    text: z.string(),
    projects: z.array(projectResultSchema),
  }),
  z.object({
    type: z.literal("resume"),
    text: z.string(),
    title: z.string(),
    url: z.string().url(),
  }),
  z.object({
    type: z.literal("contact"),
    text: z.string(),
    contact: z.object({
      email: z.string().email(),
      phone: z.string().optional(),
      linkedin: z.string(),
      github: z.string(),
      portfolioUrl: z.string(),
    }),
  }),
  z.object({
    type: z.literal("scheduling"),
    text: z.string(),
    calendlyUrl: z.string(),
    configured: z.boolean(),
  }),
  z.object({
    type: z.literal("skills"),
    text: z.string(),
    skills: z.array(skillEntrySchema),
  }),
  z.object({
    type: z.literal("education"),
    text: z.string(),
    entries: z.array(timelineEntrySchema),
  }),
  z.object({
    type: z.literal("experience"),
    text: z.string(),
    entries: z.array(experienceEntrySchema),
  }),
  z.object({
    type: z.literal("achievements"),
    text: z.string(),
    entries: z.array(achievementEntrySchema),
  }),
  z.object({ type: z.literal("error"), text: z.string() }),
]);

export type AgentResult = z.infer<typeof agentResultSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
