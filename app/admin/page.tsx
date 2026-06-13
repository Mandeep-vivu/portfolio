"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogOut, RefreshCw, Save, Upload } from "lucide-react";
import type { PortfolioData } from "@/lib/portfolio/types";
import type { ContentSection } from "@/lib/portfolio/schemas";

const SECTIONS: ContentSection[] = [
  "profile",
  "contact",
  "projects",
  "skills",
  "education",
  "experience",
  "certifications",
];

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [section, setSection] = useState<ContentSection>("projects");
  const [editor, setEditor] = useState("");
  const [status, setStatus] = useState("");
  const [storage, setStorage] = useState("");

  const loadContent = async () => {
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    if (!response.ok) {
      setAuthenticated(false);
      return;
    }
    const data = (await response.json()) as {
      portfolio: PortfolioData;
      storage: string;
    };
    setAuthenticated(true);
    setPortfolio(data.portfolio);
    setStorage(data.storage);
    setEditor(JSON.stringify(data.portfolio[section], null, 2));
  };

  useEffect(() => {
    fetch("/api/admin/session")
      .then((response) => response.json())
      .then((data: { authenticated: boolean; configured: boolean }) => {
        setConfigured(data.configured);
        setAuthenticated(data.authenticated);
        if (data.authenticated) void loadContent();
      })
      .catch(() => setAuthenticated(false));
    // Initial session check only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseSection = (next: ContentSection) => {
    setSection(next);
    if (portfolio) setEditor(JSON.stringify(portfolio[next], null, 2));
    setStatus("");
  };

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus(data.error ?? "Login failed.");
      return;
    }
    await loadContent();
  };

  const save = async () => {
    setStatus("Saving...");
    try {
      const value = JSON.parse(editor) as unknown;
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, value }),
      });
      const data = (await response.json()) as {
        portfolio?: PortfolioData;
        error?: string;
      };
      if (!response.ok || !data.portfolio) {
        throw new Error(data.error ?? "Save failed.");
      }
      setPortfolio(data.portfolio);
      setStatus("Saved. The portfolio API and AI knowledge are updated.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid JSON.");
    }
  };

  const uploadResume = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Uploading resume...");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/resume", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json()) as { url?: string; error?: string };
    setStatus(
      response.ok && data.url
        ? `Resume uploaded: ${data.url}`
        : data.error ?? "Upload failed.",
    );
    if (response.ok) await loadContent();
  };

  const reindex = async () => {
    setStatus("Refreshing index...");
    const response = await fetch("/api/admin/reindex", { method: "POST" });
    const data = (await response.json()) as {
      indexed?: number;
      error?: string;
    };
    setStatus(
      response.ok
        ? `Retrieval index refreshed from ${data.indexed} records.`
        : data.error ?? "Reindex failed.",
    );
  };

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setPortfolio(null);
  };

  if (authenticated === null) {
    return <main className="grid min-h-screen place-items-center">Loading...</main>;
  }

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <form
          onSubmit={login}
          className="surface-panel w-full max-w-md space-y-4 p-6"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
              Protected area
            </p>
            <h1 className="mt-2 text-3xl font-black text-white">
              Portfolio Admin
            </h1>
          </div>
          {!configured && (
            <p className="rounded-lg border border-amber-400/20 bg-amber-400/8 p-3 text-sm text-amber-200">
              Configure ADMIN_EMAIL, ADMIN_PASSWORD, and a 32+ character
              AUTH_SECRET before signing in.
            </p>
          )}
          <label className="block text-sm text-slate-300">
            Email
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white outline-none focus:border-primary"
            />
          </label>
          {status && <p className="text-sm text-amber-300">{status}</p>}
          <button
            type="submit"
            disabled={!configured}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-3 font-semibold text-white disabled:opacity-40"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
              Content management
            </p>
            <h1 className="mt-1 text-3xl font-black text-white">
              Mandeep Portfolio Admin
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Storage mode: {storage}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300"
          >
            <LogOut size={15} /> Sign out
          </button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <aside className="surface-panel h-fit p-3">
            {SECTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => chooseSection(item)}
                className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm capitalize ${
                  section === item
                    ? "bg-primary/20 text-white"
                    : "text-slate-400 hover:bg-white/5"
                }`}
              >
                {item}
              </button>
            ))}
            <div className="mt-4 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={reindex}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-cyan-300 hover:bg-white/5"
              >
                <RefreshCw size={14} /> Refresh index
              </button>
            </div>
          </aside>

          <section className="space-y-5">
            <div className="surface-panel p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold capitalize text-white">
                    {section}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Edit the validated JSON for this section.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={save}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                >
                  <Save size={15} /> Save
                </button>
              </div>
              <textarea
                value={editor}
                onChange={(event) => setEditor(event.target.value)}
                spellCheck={false}
                className="min-h-[520px] w-full resize-y rounded-xl border border-white/10 bg-[#02040c] p-4 font-mono text-xs leading-6 text-slate-200 outline-none focus:border-primary"
              />
            </div>

            <form
              onSubmit={uploadResume}
              className="surface-panel flex flex-wrap items-end gap-3 p-4"
            >
              <label className="min-w-0 flex-1 text-sm text-slate-300">
                Replace resume PDF (maximum 5 MB)
                <input
                  name="resume"
                  type="file"
                  accept="application/pdf"
                  required
                  className="mt-2 block w-full text-xs text-slate-400"
                />
              </label>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-indigo-100"
              >
                <Upload size={15} /> Upload
              </button>
            </form>

            {status && (
              <p
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300"
                aria-live="polite"
              >
                {status}
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
