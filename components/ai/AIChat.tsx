"use client";

import {
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ChevronRight,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  Square,
  Trash2,
  X,
} from "lucide-react";
import ChatMessage, { type UIMessage } from "./ChatMessage";
import type { AgentResult, Block, ConversationMemory } from "@/lib/ai/schemas";

interface StreamEvent {
  event: "result" | "blocks" | "delta" | "done" | "error" | "thinking" | "suggestions" | "memory";
  data?: AgentResult | string | string[] | Block[] | ConversationMemory | { type: string; content: string };
}

function isStreamEvent(obj: unknown): obj is StreamEvent {
  if (!obj || typeof obj !== 'object') return false;
  const casted = obj as Record<string, unknown>;
  const validEvents = ["result", "blocks", "delta", "done", "error", "thinking", "suggestions", "memory"];
  return typeof casted.event === 'string' && validEvents.includes(casted.event);
}

const STORAGE_KEY = "mandeep-ai-chat-v1";
const DEFAULT_SUGGESTIONS = [
  "Schedule an interview",
  "Download his resume",
  "Tell me about Mandeep",
  "What AI projects has he built?",
  "What is his strongest technical stack?",
  "How can I contact him?",
];

const WELCOME: UIMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm **Mandeep AI** — your intelligent guide to Mandeep's portfolio. 🎯\n\nI can help you explore his **skills**, **projects**, **education**, **experience**, and more. What would you like to know?",
};

function id() {
  return crypto.randomUUID();
}

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UIMessage[]>([WELCOME]);
  const [memory, setMemory] = useState<ConversationMemory | null>(null);
  const [generating, setGenerating] = useState(false);
  const [lastPrompt, setLastPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          messages?: UIMessage[];
          suggestions?: string[];
          memory?: ConversationMemory;
        };
        if (Array.isArray(parsed.messages)) setMessages(parsed.messages);
        if (Array.isArray(parsed.suggestions))
          setSuggestions(parsed.suggestions);
        if (parsed.memory) setMemory(parsed.memory);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ messages, suggestions, memory }),
    );
    
    const el = scrollRef.current;
    if (el) {
      const isNewMessage = messages.length > prevMessagesLength.current;
      prevMessagesLength.current = messages.length;
      
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      if (isNearBottom || isNewMessage) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, suggestions, memory]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    if (mobile) document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus(), 150);

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const submit = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || generating) return;

      const userMessage: UIMessage = {
        id: id(),
        role: "user",
        content: trimmed,
      };
      const assistantId = id();
      const history = [...messages, userMessage]
        .filter((message) => !message.pending && !message.error && !message.thinking)
        .slice(-10)
        .map(({ role, content }) => ({ role, content }));

      setMessages((current) => [
        ...current,
        userMessage,
        { id: assistantId, role: "assistant", content: "", pending: true },
      ]);
      setInput("");
      setLastPrompt(trimmed);
      setGenerating(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, memory }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error || "The assistant is unavailable.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            let parsed;
            try {
              parsed = JSON.parse(line);
            } catch (e) {
              continue;
            }
            if (!isStreamEvent(parsed)) continue;
            const event = parsed;

            if (event.event === "thinking") {
              setMessages((current) =>
                current.map((message) =>
                  message.id === assistantId
                    ? { ...message, thinking: true, pending: false, thinkingText: typeof event.data === 'string' ? event.data : undefined }
                    : message,
                ),
              );
              continue;
            }

            if (event.event === "suggestions") {
              if (Array.isArray(event.data)) {
                setSuggestions(event.data as string[]);
              }
              continue;
            }

            if (event.event === "memory") {
              setMemory(event.data as ConversationMemory);
              continue;
            }

            setMessages((current) =>
              current.map((message) => {
                if (message.id !== assistantId) return message;
                if (event.event === "result") {
                  const result = event.data as AgentResult;
                  return {
                    ...message,
                    pending: result.type === "text" && !result.text,
                    thinking: false,
                    content: result.text,
                    result: result.type === "text" ? undefined : result,
                  };
                }
                if (event.event === "blocks") {
                  return {
                    ...message,
                    pending: false,
                    thinking: false,
                    blocks: event.data as Block[],
                  };
                }
                if (event.event === "delta") {
                  return {
                    ...message,
                    pending: false,
                    thinking: false,
                    content: (message.content || "") + String(event.data ?? ""),
                  };
                }
                if (event.event === "error") {
                  let errorContent = String(event.data);
                  if (typeof event.data === 'object' && event.data !== null && 'content' in event.data) {
                    errorContent = String((event.data as any).content);
                  }
                  return {
                    ...message,
                    pending: false,
                    thinking: false,
                    error: true,
                    content: errorContent,
                  };
                }
                return { ...message, pending: false, thinking: false };
              }),
            );
          }
        }
      } catch (error) {
        const aborted = controller.signal.aborted;
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  pending: false,
                  thinking: false,
                  error: !aborted,
                  content: aborted
                    ? "Generation stopped."
                    : error instanceof Error
                      ? error.message
                      : "The assistant is unavailable.",
                }
              : message,
          ),
        );
      } finally {
        abortRef.current = null;
        setGenerating(false);
      }
    },
    [generating, messages],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit(input);
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const clearHistory = () => {
    abortRef.current?.abort();
    setMessages([WELCOME]);
    setMemory(null);
    setSuggestions(DEFAULT_SUGGESTIONS);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  // Determine if we should show inline suggestion chips at the bottom of messages
  const lastMsg = messages.at(-1);
  const showInlineChips =
    !generating &&
    lastMsg?.role === "assistant" &&
    !lastMsg.error &&
    !lastMsg.pending &&
    messages.length > 1;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Mandeep AI"
        className="fixed bottom-5 right-5 z-[70] flex h-14 items-center gap-2 rounded-2xl border border-primary/35 bg-[#080d1d]/95 px-4 text-sm font-semibold text-white shadow-[0_18px_55px_rgba(0,0,0,.55),0_0_30px_rgba(99,102,241,.25)] backdrop-blur-xl sm:bottom-6 sm:right-6"
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="relative">
          <MessageCircle size={21} className="text-cyan-300" />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="hidden sm:inline">Ask Mandeep AI</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[71] bg-[#02040c]/65 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Mandeep AI chat"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-[72] flex flex-col overflow-hidden border border-white/10 bg-[#050916]/98 shadow-2xl sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(760px,calc(100dvh-40px))] sm:w-[min(920px,calc(100vw-40px))] sm:rounded-3xl"
            >
              <header className="flex items-center justify-between border-b border-white/10 bg-white/[0.025] px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-neon-sm">
                    <Bot size={21} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-display text-base font-bold text-white">
                      Mandeep AI <Sparkles size={13} className="text-cyan-300" />
                    </span>
                    <span className="block truncate text-[0.7rem] text-slate-400">
                      Intelligent portfolio assistant
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                    aria-label="Clear chat history"
                  >
                    <Trash2 size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                    aria-label="Close chat"
                  >
                    <X size={19} />
                  </button>
                </div>
              </header>

              <div className="grid min-h-0 flex-1 sm:grid-cols-[1fr_230px]">
                <div className="flex min-h-0 flex-col">
                  <div
                    ref={scrollRef}
                    className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5"
                    aria-live="polite"
                  >
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}

                    {/* Inline suggestion chips after last assistant message */}
                    {showInlineChips && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="flex flex-wrap gap-1.5 pl-1"
                      >
                        {suggestions.slice(0, 5).map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => void submit(suggestion)}
                            disabled={generating}
                            className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[0.68rem] text-slate-300 transition hover:border-primary/30 hover:bg-primary/8 hover:text-white disabled:opacity-40"
                          >
                            <ChevronRight
                              size={10}
                              className="text-cyan-400/60"
                            />
                            {suggestion}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  <form
                    onSubmit={onSubmit}
                    className="border-t border-white/10 bg-[#050916]/95 p-3 sm:p-4"
                  >
                    {messages.at(-1)?.error && lastPrompt && (
                      <button
                        type="button"
                        onClick={() => void submit(lastPrompt)}
                        className="mb-2 inline-flex items-center gap-1.5 text-xs text-cyan-300"
                      >
                        <RefreshCw size={12} /> Retry last message
                      </button>
                    )}
                    <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 focus-within:border-primary/45">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(event) =>
                          setInput(event.target.value.slice(0, 4000))
                        }
                        onKeyDown={onInputKeyDown}
                        placeholder="Ask about Mandeep..."
                        rows={1}
                        disabled={generating}
                        className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-600"
                      />
                      {generating ? (
                        <button
                          type="button"
                          onClick={() => abortRef.current?.abort()}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-400/15 text-red-300"
                          aria-label="Stop generating"
                        >
                          <Square size={15} fill="currentColor" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={!input.trim()}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white disabled:opacity-35"
                          aria-label="Send message"
                        >
                          <Send size={16} />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-center text-[0.62rem] text-slate-600">
                      Grounded only in Mandeep&apos;s portfolio knowledge.
                    </p>
                  </form>
                </div>

                <aside className="hidden border-l border-white/10 bg-white/[0.018] p-4 sm:block">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-slate-500">
                    Suggested prompts
                  </p>
                  <div className="mt-3 space-y-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => void submit(suggestion)}
                        disabled={generating}
                        className="w-full rounded-xl border border-white/8 bg-white/[0.025] p-3 text-left text-xs leading-5 text-slate-300 transition hover:border-primary/30 hover:bg-primary/8 hover:text-white disabled:opacity-40"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </aside>
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
