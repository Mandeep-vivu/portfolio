import { generateObject, type LanguageModel } from "ai";
import { BUSY_MESSAGE, answerLocalIntent, blocksFromContext } from "@/lib/ai/answers";
import { getAIModel, getGroqModel, GROUNDED_ANSWER_PROMPT } from "@/lib/ai/gemini";
import { retrieveHybridContext } from "@/lib/ai/hybrid";
import { detectLocalIntent } from "@/lib/ai/intents";
import { resolveLocalReference, updateMemoryLocally } from "@/lib/ai/memory";
import {
  chatRequestSchema,
  singleTurnResponseSchema,
  type Block,
  type ChatMessage,
  type ConversationMemory,
} from "@/lib/ai/schemas";
import { generateSuggestions } from "@/lib/ai/suggestions";
import { getPortfolio } from "@/lib/portfolio/repository";
import type { PortfolioData } from "@/lib/portfolio/types";
import { rateLimit, requestIdentity } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Answer = {
  blocks: Block[];
  intent: string;
  referencedEntities: string[];
};

function streamEvent(value: unknown) {
  return `${JSON.stringify(value)}\n`;
}

function isQuotaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /quota|429|RESOURCE_EXHAUSTED|rate.?limit/i.test(message);
}

/**
 * Answers an open-ended question with one grounded model call. Tries the
 * primary model, then Groq when the primary is out of quota, and finally
 * falls back to the retrieved portfolio context so the visitor still gets a
 * useful reply when no provider is reachable.
 */
async function answerWithModel(
  question: string,
  history: ChatMessage[],
  memory: ConversationMemory | null | undefined,
  portfolio: PortfolioData,
): Promise<Answer> {
  const resolvedQuestion = resolveLocalReference(question, memory);
  const context = await retrieveHybridContext(resolvedQuestion, portfolio, 5);

  const fallback = (): Answer => {
    const blocks = blocksFromContext(
      context,
      "Based on Mandeep's portfolio, here is the relevant information:",
    );
    return {
      blocks: blocks.length > 0 ? blocks : [{ type: "error", content: BUSY_MESSAGE }],
      intent: "UNKNOWN",
      referencedEntities: [],
    };
  };

  const system = [
    GROUNDED_ANSWER_PROMPT,
    `CURRENT CONVERSATION MEMORY:\n${memory ? JSON.stringify(memory, null, 2) : "No memory yet."}`,
    `RETRIEVED PORTFOLIO CONTEXT:\n${JSON.stringify(context, null, 2)}`,
  ].join("\n\n");

  const messages = [
    ...history.map(({ role, content }) => ({ role, content })),
    { role: "user" as const, content: resolvedQuestion },
  ];

  const generate = (model: LanguageModel) =>
    generateObject({ model, system, messages, schema: singleTurnResponseSchema });

  const primary = getAIModel();
  const groq = getGroqModel();
  let result: Awaited<ReturnType<typeof generate>> | null = null;

  if (primary) {
    try {
      result = await generate(primary);
    } catch (error) {
      console.error("Primary model error:", error);
      if (!isQuotaError(error)) return fallback();
    }
  }

  if (!result && groq) {
    try {
      result = await generate(groq);
    } catch (error) {
      console.error("Groq fallback error:", error);
    }
  }

  if (!result) return fallback();

  const answer = result.object;
  const blocks: Block[] = [];

  if (answer.needsClarification && answer.clarificationQuestion) {
    blocks.push({ type: "text", content: answer.clarificationQuestion });
  } else if (answer.response) {
    blocks.push({ type: "text", content: answer.response });
  }

  const aboutProjects =
    answer.intent.toUpperCase().includes("PROJECT") || answer.activeTopic === "Projects";
  if (aboutProjects && context.matchedProjects.length > 0) {
    blocks.push({ type: "project_card", projects: context.matchedProjects });
  }

  return {
    blocks: blocks.length > 0 ? blocks : fallback().blocks,
    intent: answer.intent,
    referencedEntities: answer.referencedEntities ?? [],
  };
}

export async function POST(request: Request) {
  const limit = rateLimit(`chat:${requestIdentity(request)}`, 20, 60_000);
  if (!limit.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))),
        },
      },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const { messages, memory } = parsed.data;
  const lastMessage = messages.at(-1);
  if (!lastMessage || lastMessage.role !== "user" || !lastMessage.content.trim()) {
    return Response.json({ error: "The last message must be a user question." }, { status: 400 });
  }

  const question = lastMessage.content.trim();
  const history = messages.slice(0, -1).filter((message) => message.content.trim());
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (value: unknown) => controller.enqueue(encoder.encode(streamEvent(value)));
      const startedAt = Date.now();
      let route = "local";

      try {
        send({ event: "thinking" });

        const portfolio = await getPortfolio();
        const localIntent = detectLocalIntent(question);
        let answer: Answer;

        if (localIntent) {
          answer = {
            blocks: await answerLocalIntent(localIntent, question, portfolio),
            intent: localIntent,
            referencedEntities: [],
          };
        } else {
          route = "model";
          answer = await answerWithModel(question, history, memory, portfolio);
        }

        send({ event: "blocks", data: answer.blocks });
        send({
          event: "memory",
          data: updateMemoryLocally(memory, messages, answer.intent, answer.referencedEntities),
        });
        send({ event: "suggestions", data: generateSuggestions(messages, "text") });
        send({ event: "done" });
      } catch (error) {
        console.error("Chat error:", error);
        send({ event: "blocks", data: [{ type: "error", content: BUSY_MESSAGE }] });
      } finally {
        console.info("chat", { route, ms: Date.now() - startedAt });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
      "X-Accel-Buffering": "no",
    },
  });
}
