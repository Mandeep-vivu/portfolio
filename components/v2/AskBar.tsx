"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { askAssistant } from "./ask";

const STARTERS = [
  "What did the grid-fault research achieve?",
  "Which projects use Flutter?",
  "How do I book a call?",
];

/** Hero prompt: questions typed here are answered by the portfolio assistant. */
export default function AskBar() {
  const [question, setQuestion] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    askAssistant(question);
    setQuestion("");
  };

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 rounded-[8px] border border-ink bg-sheet p-1.5 shadow-[4px_4px_0_var(--color-ink)]"
      >
        <label htmlFor="hero-question" className="sr-only">
          Ask a question about Mandeep&apos;s work
        </label>
        <MessageCircle size={20} aria-hidden className="ml-3 shrink-0 text-cobalt" />
        <input
          id="hero-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask anything about my work"
          autoComplete="off"
          maxLength={400}
          className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-[1rem] text-ink outline-none placeholder:text-quiet"
        />
        <button
          type="submit"
          className="shrink-0 rounded-[5px] bg-cobalt px-5 py-3 text-[0.95rem] font-semibold leading-none text-white transition-colors hover:bg-ink"
        >
          Ask
        </button>
      </form>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.92rem]">
        {STARTERS.map((starter) => (
          <li key={starter}>
            <button
              type="button"
              onClick={() => askAssistant(starter)}
              className="text-left text-quiet underline decoration-rule decoration-2 underline-offset-4 transition-colors hover:text-ink hover:decoration-cobalt"
            >
              {starter}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
