import { describe, expect, it } from "vitest";
import { detectLocalIntent } from "./intents";

describe("local intent routing", () => {
  it.each([
    ["hi", "GREETING"],
    ["Hello there!", "GREETING"],
    ["Download his resume", "RESUME_REQUEST"],
    ["can I see the CV?", "RESUME_REQUEST"],
    ["How old is Mandeep?", "PROFILE_AGE_REQUEST"],
    ["what is his age", "PROFILE_AGE_REQUEST"],
    ["What are his hobbies?", "PROFILE_HOBBIES_REQUEST"],
    ["Schedule an interview", "SCHEDULING_REQUEST"],
    ["I'd like to book a call with him", "SCHEDULING_REQUEST"],
    ["How can I contact him?", "CONTACT_REQUEST"],
    ["what's his email", "CONTACT_REQUEST"],
    ["Any certifications?", "CERTIFICATION_REQUEST"],
    ["Has he won any awards?", "ACHIEVEMENT_REQUEST"],
    ["What are his skills", "FAQ_REQUEST"],
  ] as const)("routes %j to %s", (message, intent) => {
    expect(detectLocalIntent(message)).toBe(intent);
  });

  // Each of these used to be hijacked by a substring match.
  it.each([
    "What programming languages does he know?", // "langu-age"
    "Does he have experience managing a team?", // "man-age"
    "Tell me about his research on grid faults", // "re-search" / "reach"
    "Is he interested in backend roles?", // "interest-ed"
    "Show me his GitHub projects", // bare "github"
    "Which mobile apps has he built?", // bare "mobile"
    "Tell me about his academic background", // bare "academic"
    "Hey, what is his strongest technical stack?", // greeting prefix
    "What AI projects has he built?",
    "Has he built a discovery tool?", // "cv" inside "discovery"
  ])("leaves %j for the model", (message) => {
    expect(detectLocalIntent(message)).toBeNull();
  });

  it("ignores empty input", () => {
    expect(detectLocalIntent("   ")).toBeNull();
  });
});
