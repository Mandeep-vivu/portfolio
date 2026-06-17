import type { AgentResult, ChatMessage } from "./schemas";

// ---------------------------------------------------------------------------
// Starter suggestions — shown when conversation is fresh
// ---------------------------------------------------------------------------

const STARTER_SUGGESTIONS = [
  "Tell me about Mandeep",
  "What AI projects has he built?",
  "What is his strongest technical stack?",
  "Download his resume",
  "How can I contact him?",
  "Schedule an interview",
];

// ---------------------------------------------------------------------------
// Context-aware follow-up suggestions
// ---------------------------------------------------------------------------

const PINNED_SUGGESTIONS = [
  "Schedule an interview",
  "Download his resume",
];

const FOLLOW_UP_MAP = {
  projects: [
    "What technologies did he use?",
    "Does he have more projects?",
    "What's his strongest skill?",
    "Show me his AI work",
  ],
  resume: [
    "Tell me about his experience",
    "What skills does he have?",
    "Show me his projects",
    "Schedule an interview",
  ],
  contact: [
    "Schedule an interview",
    "Download his resume",
    "What's his availability?",
    "Tell me about his skills",
  ],
  scheduling: [
    "Tell me about his background",
    "What are his strongest skills?",
    "Show me his projects",
    "Get his contact info",
  ],
  skills: [
    "Show me his AI projects",
    "What's his education?",
    "Tell me about his experience",
    "Download his resume",
  ],
  education: [
    "What are his skills?",
    "Show me his projects",
    "Tell me about his experience",
    "Any certifications?",
  ],
  experience: [
    "What are his skills?",
    "Show me his projects",
    "Tell me about his education",
    "Schedule an interview",
  ],
  achievements: [
    "Tell me about his education",
    "What are his skills?",
    "Show me his projects",
    "Download his resume",
  ],
  text: [
    "Show me his projects",
    "What are his skills?",
    "Tell me about his education",
    "How can I contact him?",
  ],
};


// Topics user has already asked about, determined by result types
function getDiscussedTopics(messages: ChatMessage[]): Set<string> {
  const topics = new Set<string>();
  for (const msg of messages) {
    if (msg.role !== "user") continue;
    const lower = msg.content.toLowerCase();
    if (/project|built|app/i.test(lower)) topics.add("projects");
    if (/skill|technolog|stack|proficien/i.test(lower)) topics.add("skills");
    if (/education|degree|university|college/i.test(lower)) topics.add("education");
    if (/experience|work|intern|job|career/i.test(lower)) topics.add("experience");
    if (/contact|email|linkedin|github/i.test(lower)) topics.add("contact");
    if (/resume|cv/i.test(lower)) topics.add("resume");
    if (/schedule|book|meeting|interview/i.test(lower)) topics.add("scheduling");
    if (/certif|award|achievement/i.test(lower)) topics.add("achievements");
  }
  return topics;
}

/**
 * Generate context-aware suggestions based on conversation history
 * and the most recent result type.
 */
export function generateSuggestions(
  messages: ChatMessage[],
  lastResultType?: AgentResult["type"],
): string[] {
  // If no messages beyond welcome, return starters but ensure PINNED_SUGGESTIONS are at the top
  const userMessages = messages.filter((m) => m.role === "user");
  if (userMessages.length === 0) {
    const starters = STARTER_SUGGESTIONS.filter(s => !PINNED_SUGGESTIONS.includes(s));
    return [...PINNED_SUGGESTIONS, ...starters].slice(0, 8);
  }

  const discussed = getDiscussedTopics(messages);
  // Determine result type safely
  const resultTypeKey = (lastResultType && (lastResultType in FOLLOW_UP_MAP)) ? lastResultType : "text";
  const resultType = resultTypeKey as keyof typeof FOLLOW_UP_MAP;
  // Get base follow-ups from the last result type
  const fallback = FOLLOW_UP_MAP.text ?? [];
  const baseSuggestions = FOLLOW_UP_MAP[resultType] ?? fallback;

  // Filter out any of the alwaysPresent suggestions to avoid duplicates
  const dynamicCandidates = baseSuggestions.filter(
    (s) => !PINNED_SUGGESTIONS.includes(s)
  );

  // Sort: undiscussed topics first
  const sorted = [...dynamicCandidates].sort((a, b) => {
    const aDiscussed = isTopicDiscussed(a, discussed);
    const bDiscussed = isTopicDiscussed(b, discussed);
    if (aDiscussed && !bDiscussed) return 1;
    if (!aDiscussed && bDiscussed) return -1;
    return 0;
  });

  // Also extract unexplored starters that are not in alwaysPresent
  const unexploredStarters = STARTER_SUGGESTIONS.filter(
    (s) => !PINNED_SUGGESTIONS.includes(s) && !isTopicDiscussed(s, discussed)
  );

  const result = [...PINNED_SUGGESTIONS];

  // First fill with sorted dynamic suggestions
  for (const s of sorted) {
    if (!result.includes(s) && result.length < 8) {
      result.push(s);
    }
  }

  // Then fill with unexplored starters
  for (const s of unexploredStarters) {
    if (!result.includes(s) && result.length < 8) {
      result.push(s);
    }
  }

  // If still not full, add remaining starter suggestions that are not already present
  for (const s of STARTER_SUGGESTIONS) {
    if (!result.includes(s) && result.length < 8) {
      result.push(s);
    }
  }

  return result;
}

function isTopicDiscussed(suggestion: string, discussed: Set<string>): boolean {
  const lower = suggestion.toLowerCase();
  if (discussed.has("projects") && /project|built/i.test(lower)) return true;
  if (discussed.has("skills") && /skill|tech|stack/i.test(lower)) return true;
  if (discussed.has("education") && /education/i.test(lower)) return true;
  if (discussed.has("experience") && /experience/i.test(lower)) return true;
  if (discussed.has("contact") && /contact/i.test(lower)) return true;
  if (discussed.has("resume") && /resume/i.test(lower)) return true;
  if (discussed.has("scheduling") && /schedule|interview/i.test(lower)) return true;
  if (discussed.has("achievements") && /certif|award|achievement/i.test(lower)) return true;
  return false;
}
