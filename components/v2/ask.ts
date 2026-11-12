/** Name of the window event that opens the chat, optionally with a question. */
export const ASK_EVENT = "mandeep-ai:ask";

export type AskDetail = { prompt?: string };

/** Opens the chat assistant. With a prompt, the question is sent right away. */
export function askAssistant(prompt?: string) {
  const detail: AskDetail = prompt?.trim() ? { prompt: prompt.trim() } : {};
  window.dispatchEvent(new CustomEvent<AskDetail>(ASK_EVENT, { detail }));
}
