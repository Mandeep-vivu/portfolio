import { ZodError } from "zod";
import { generateObject } from "ai";
import { getAIModel, GROUNDED_ANSWER_PROMPT } from "@/lib/ai/gemini";
import { retrieveRAGContext } from "@/lib/ai/rag";
import { chatRequestSchema, singleTurnResponseSchema } from "@/lib/ai/schemas";
import { getPortfolio } from "@/lib/portfolio/repository";
import { rateLimit, requestIdentity } from "@/lib/security/rate-limit";
import { generateSuggestions } from "@/lib/ai/suggestions";
import { resolveLocalReference, updateMemoryLocally } from "@/lib/ai/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function streamEvent(value: unknown) {
  return `${JSON.stringify(value)}\n`;
}

export async function POST(request: Request) {
  const identity = requestIdentity(request);
  const limit = rateLimit(`chat:${identity}`, 20, 60_000);

  if (!limit.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000)),
          ),
        },
      },
    );
  }

  try {
    const payload = chatRequestSchema.parse(await request.json());
    const encoder = new TextEncoder();
    
    // We get model later. It may be missing (e.g. quota), but local routing should still work!
    let model: any = null;
    try {
      model = getAIModel();
    } catch (e) {
      // Ignore missing config until we actually need Gemini
    }

    const stream = new ReadableStream({
      async start(controller) {
        let metrics = { query: "", usedGemini: false, usedRAG: false, usedTool: false, responseTime: 0 };
        const startTime = Date.now();

        try {
          const currentMessages = payload.messages as any[];
          const lastMessage = currentMessages[currentMessages.length - 1].content.toLowerCase();
          metrics.query = lastMessage;

          let blocks: any[] = [];
          let currentMemory = payload.memory;
          let intentStr = "UNKNOWN";
          let referencedEntities: string[] = [];

          controller.enqueue(encoder.encode(streamEvent({ event: "thinking" })));

          // --- 1. LOCAL ROUTING (NO GEMINI) ---
          if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|yo|sup)(\s|$)/.test(lastMessage)) {
             intentStr = "GREETING";
             blocks.push({ type: "text", content: "Hello! I'm Mandeep AI. I can help you explore Mandeep's portfolio, skills, and projects. What would you like to know?" });
          }
          else if (/resume|cv|download resume|download cv/.test(lastMessage)) {
             intentStr = "RESUME_REQUEST";
             metrics.usedTool = true;
             const portfolio = await getPortfolio();
             if (portfolio.profile.resumeUrl) {
                blocks.push({ 
                  type: "resume_link", 
                  url: portfolio.profile.resumeUrl, 
                  title: `${portfolio.profile.name} - Resume` 
                });
             } else {
                blocks.push({ type: "text", content: "Resume not found" });
             }
          } 
          else if (/contact|email|github|linkedin|phone number/.test(lastMessage)) {
             intentStr = "CONTACT_REQUEST";
             metrics.usedTool = true;
             const portfolio = await getPortfolio();
             blocks.push({
               type: "contact",
               email: portfolio.contact.email,
               phone: portfolio.contact.phone,
               linkedin: portfolio.contact.linkedin,
               github: portfolio.contact.github,
               portfolioUrl: portfolio.contact.portfolioUrl || process.env.NEXT_PUBLIC_SITE_URL || "",
             });
          }
          else if (/schedule meeting|book interview|arrange call|calendly/.test(lastMessage)) {
             intentStr = "SCHEDULING_REQUEST";
             metrics.usedTool = true;
             const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "";
             if (calendlyUrl) {
               blocks.push({ type: "schedule", url: calendlyUrl });
             } else {
               blocks.push({ type: "error", content: "Scheduling is not configured yet." });
             }
          }
          else if (/what are his skills|what is his education|what certifications does he have|tell me about his experience/.test(lastMessage)) {
             intentStr = "FAQ_REQUEST";
             metrics.usedRAG = true;
             const ragRes = await retrieveRAGContext(lastMessage, 4);
             if (ragRes.chunks.length > 0) {
               let text = "Based on Mandeep's portfolio:\n\n";
               
               const projects = ragRes.chunks.filter((c: any) => c.type === "project");
               const others = ragRes.chunks.filter((c: any) => c.type !== "project");
               
               if (others.length > 0) {
                 text += others.map((c: any) => `**${c.title}**: ${c.content}`).join("\n\n");
                 blocks.push({ type: "text", content: text });
               }
               if (projects.length > 0) {
                 const projData = projects.map((p: any) => ({
                    id: p.id, title: p.title, description: p.content, tech: p.metadata?.tech || [], github: p.metadata?.github, demo: p.metadata?.demo
                 }));
                 blocks.push({ type: "project_card", projects: projData });
               }
             } else {
               blocks.push({ type: "text", content: "I couldn't find specific information about that in the portfolio." });
             }
          }
          else {
            // --- 2. SINGLE GEMINI CALL (COMPLEX) ---
            if (!model) {
               throw new Error("AI is not configured. Please add GEMINI_API_KEY to your environment variables.");
            }
            metrics.usedGemini = true;
            
            // Resolve local references first
            const resolvedQuery = resolveLocalReference(lastMessage, currentMemory);
            
            // RAG Retrieval
            metrics.usedRAG = true;
            const ragRes = await retrieveRAGContext(resolvedQuery, 5);
            
            let systemPrompt = `${GROUNDED_ANSWER_PROMPT}\n\nCURRENT CONVERSATION MEMORY:\n${
              currentMemory ? JSON.stringify(currentMemory, null, 2) : "No memory yet."
            }\n\nRETRIEVED PORTFOLIO CONTEXT:\n${JSON.stringify(ragRes.chunks, null, 2)}`;
            
            const aiCallMessages = [
               ...currentMessages.slice(0, -1),
               { role: "user", content: resolvedQuery }
            ];

            let aiResult;
            try {
              aiResult = await generateObject({
                model,
                system: systemPrompt,
                messages: aiCallMessages as any[],
                schema: singleTurnResponseSchema,
              });
            } catch (err: any) {
              console.error("Gemini Quota/API Error:", err);
              // 429 QUOTA FALLBACK
              const isQuotaError = err?.message?.includes("quota") || err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED");
              
              if (isQuotaError && ragRes.chunks.length > 0) {
                 let fallbackText = "Based on Mandeep's portfolio, here is the relevant information:\n\n";
                 
                 const projects = ragRes.chunks.filter((c: any) => c.type === "project");
                 const others = ragRes.chunks.filter((c: any) => c.type !== "project");
                 
                 if (others.length > 0) {
                   fallbackText += others.map((c: any) => `**${c.title}**: ${c.content}`).join("\n\n");
                   blocks.push({ type: "text", content: fallbackText });
                 }
                 if (projects.length > 0) {
                   const projData = projects.map((p: any) => ({
                      id: p.id, title: p.title, description: p.content, tech: p.metadata?.tech || [], github: p.metadata?.github, demo: p.metadata?.demo
                   }));
                   blocks.push({ type: "project_card", projects: projData });
                 }
              } else {
                 blocks.push({ type: "error", content: "The AI assistant is temporarily busy. Please try again in a few minutes." });
              }
            }
            
            if (aiResult?.object) {
               const obj = aiResult.object;
               intentStr = obj.intent;
               referencedEntities = obj.referencedEntities || [];
               
               if (obj.needsClarification && obj.clarificationQuestion) {
                 blocks.push({ type: "text", content: obj.clarificationQuestion });
               } else if (obj.response) {
                 blocks.push({ type: "text", content: obj.response });
               }
               
               // Render project cards if projects were retrieved and it's a project query
               if (intentStr.includes("PROJECT") || obj.activeTopic === "Projects") {
                  const projects = ragRes.chunks.filter((c: any) => c.type === "project");
                  if (projects.length > 0) {
                    const projData = projects.map((p: any) => ({
                      id: p.id, title: p.title, description: p.content, tech: p.metadata?.tech || [], github: p.metadata?.github, demo: p.metadata?.demo
                    }));
                    // Avoid duplicating project cards
                    if (!blocks.some(b => b.type === "project_card")) {
                      blocks.push({ type: "project_card", projects: projData });
                    }
                  }
               }
            }
          }

          if (blocks.length === 0) {
            blocks.push({ type: "error", content: "The AI assistant is temporarily busy. Please try again in a few minutes." });
          }
          
          controller.enqueue(encoder.encode(streamEvent({ event: "blocks", data: blocks })));
          
          // --- 3. MEMORY UPDATE ---
          const nextMemory = updateMemoryLocally(currentMemory, currentMessages, intentStr, referencedEntities);
          controller.enqueue(encoder.encode(streamEvent({ event: "memory", data: nextMemory })));

          const suggestions = generateSuggestions(currentMessages, "text");
          controller.enqueue(encoder.encode(streamEvent({ event: "suggestions", data: suggestions })));
          
          controller.enqueue(encoder.encode(streamEvent({ event: "done" })));
          
          metrics.responseTime = Date.now() - startTime;
          console.log("METRICS", metrics);
          
        } catch (error: any) {
          console.error("Agent Error:", error);
          metrics.responseTime = Date.now() - startTime;
          console.log("METRICS", metrics);
          
          controller.enqueue(
            encoder.encode(
              streamEvent({
                event: "blocks",
                data: [{ type: "error", content: "The AI assistant is temporarily busy. Please try again in a few minutes." }],
              }),
            ),
          );
        } finally {
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
  } catch (error) {
    const message = error instanceof ZodError ? "Invalid chat request." : "Unable to process the chat request.";
    return Response.json({ error: message }, { status: 400 });
  }
}
