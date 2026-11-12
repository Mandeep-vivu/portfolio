/**
 * Local intent routing for the chat API.
 *
 * Questions with a well-known answer (resume, contact details, scheduling…)
 * are answered straight from portfolio data without calling an LLM. Every
 * pattern is anchored on word boundaries: matching bare substrings sends
 * questions like "what languages does he know?" to the *age* answer because
 * "language" contains "age".
 */

export type LocalIntent =
  | "GREETING"
  | "RESUME_REQUEST"
  | "PROFILE_AGE_REQUEST"
  | "PROFILE_HOBBIES_REQUEST"
  | "SCHEDULING_REQUEST"
  | "CONTACT_REQUEST"
  | "CERTIFICATION_REQUEST"
  | "ACHIEVEMENT_REQUEST"
  | "FAQ_REQUEST";

const MEETING = "(?:interview|meeting|call|slot|appointment|chat)";

// Order matters: the first matching rule wins.
const RULES: ReadonlyArray<readonly [LocalIntent, RegExp]> = [
  [
    "GREETING",
    // Only a bare greeting. "Hey, what are his skills?" is a real question.
    /^(?:hi|hii+|hello|hey|heya|greetings|namaste|good (?:morning|afternoon|evening)|yo|sup)(?:\s+(?:there|mandeep|ai|bot))*[\s!.,?]*$/,
  ],
  ["RESUME_REQUEST", /\b(?:resume|résumé|cv|curriculum vitae)\b/],
  [
    "PROFILE_AGE_REQUEST",
    /\b(?:how old|(?:his|mandeep'?s?|your) age|age of|what age|date of birth|birth ?date|dob|born|birthday)\b/,
  ],
  [
    "PROFILE_HOBBIES_REQUEST",
    /\b(?:hobby|hobbies|interests|free time|spare time|outside (?:of )?work|likes? to do)\b/,
  ],
  [
    "SCHEDULING_REQUEST",
    new RegExp(
      `\\b(?:schedule|calendly|book(?:ing)?\\s+(?:an?\\s+|the\\s+)?${MEETING}|(?:arrange|set up|setup)\\s+(?:an?\\s+|the\\s+)?${MEETING})\\b`,
    ),
  ],
  [
    "CONTACT_REQUEST",
    /\b(?:contact|e-?mail|phone|(?:mobile|contact) number|whatsapp|linkedin|github (?:profile|link|account|url|id|handle)|get in touch|reach (?:out|him|mandeep)|connect with|call (?:him|mandeep)|how (?:can|do) i (?:call|reach|connect))\b/,
  ],
  ["CERTIFICATION_REQUEST", /\b(?:certifications?|certificates?|certified|credentials?)\b/],
  ["ACHIEVEMENT_REQUEST", /\b(?:achievements?|awards?|honou?rs?|recognitions?|leadership)\b/],
  [
    "FAQ_REQUEST",
    /\b(?:what are his skills|what is his education|tell me about his experience)\b/,
  ],
];

/** Returns the local intent for a message, or null when the LLM should answer. */
export function detectLocalIntent(message: string): LocalIntent | null {
  const normalized = message.toLowerCase().replace(/\s+/g, " ").trim();
  if (!normalized) return null;

  for (const [intent, pattern] of RULES) {
    if (pattern.test(normalized)) return intent;
  }
  return null;
}
