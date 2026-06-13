import { ConversationMemory, ChatMessage } from "./schemas";

export function updateMemoryLocally(
  currentMemory: ConversationMemory | null | undefined,
  messages: ChatMessage[],
  intent: string,
  entities: string[]
): ConversationMemory {
  const mem = currentMemory || {
    activeTopic: null,
    lastProjects: [],
    lastSkills: [],
    lastEntities: [],
    recentMessages: []
  };

  const lastUserMessage = messages.filter(m => m.role === "user").pop();
  if (lastUserMessage && lastUserMessage.content) {
    mem.recentMessages.push({ role: "user", content: lastUserMessage.content });
  }

  // Update active topic and entity history
  const upperIntent = intent.toUpperCase();
  if (upperIntent.includes("PROJECT")) {
    mem.activeTopic = "Projects";
    mem.lastProjects = Array.from(new Set([...mem.lastProjects, ...entities])).slice(-5);
  } else if (upperIntent.includes("SKILL")) {
    mem.activeTopic = "Skills";
    mem.lastSkills = Array.from(new Set([...mem.lastSkills, ...entities])).slice(-5);
  } else if (upperIntent.includes("EDUCATION") || upperIntent.includes("EXPERIENCE") || upperIntent.includes("RESUME")) {
    mem.activeTopic = intent;
  }

  mem.lastEntities = Array.from(new Set([...mem.lastEntities, ...entities])).slice(-5);

  if (mem.recentMessages.length > 10) {
    mem.recentMessages = mem.recentMessages.slice(-10);
  }

  return mem;
}

export function resolveLocalReference(query: string, memory?: ConversationMemory | null): string {
  if (!memory) return query;
  
  const lowerQuery = query.toLowerCase();
  
  // Basic positional reference resolution
  if (lowerQuery.includes("first one") && memory.lastProjects.length > 0) return memory.lastProjects[0] || query;
  if (lowerQuery.includes("second one") && memory.lastProjects.length > 1) return memory.lastProjects[1] || query;
  if (lowerQuery.includes("last one") && memory.lastProjects.length > 0) return memory.lastProjects[memory.lastProjects.length - 1] || query;

  const isVague = /tell me more|what about (it|them)|compare them|which one/.test(lowerQuery);
  
  if (isVague) {
    if (memory.activeTopic === "Projects" && memory.lastProjects.length > 0) {
      return `${query} (Context: ${memory.lastProjects.join(", ")})`;
    } else if (memory.activeTopic === "Skills" && memory.lastSkills.length > 0) {
      return `${query} (Context: ${memory.lastSkills.join(", ")})`;
    } else if (memory.lastEntities.length > 0) {
      return `${query} (Context: ${memory.lastEntities.join(", ")})`;
    }
  }
  
  return query;
}
