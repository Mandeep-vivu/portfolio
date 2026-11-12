"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { FiGithub, FiLinkedin } from "react-icons/fi";
import { usePortfolio } from "@/components/providers/PortfolioProvider";
import { safeHref } from "@/lib/url";
import { askAssistant } from "./ask";
import { Container, buttonStyles } from "./Shell";

// Messages are delivered through a Google Form; these are its field ids.
const FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSdiI98imxNn52N2qqSXxQnDSPGHbNW4T-AbkvZ_9dnl2PfYqA/formResponse";
const FORM_FIELDS = {
  email: "entry.1533642336",
  name: "entry.92201254",
  mobileNumber: "entry.1627041930",
  message: "entry.1141246171",
} as const;

type FormState = Record<keyof typeof FORM_FIELDS, string>;
type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: FormState = { name: "", email: "", mobileNumber: "", message: "" };

const fieldClass =
  "mt-2 w-full rounded-[6px] border border-white/25 bg-white/[0.06] px-4 py-3 text-[1rem] text-white outline-none transition-colors placeholder:text-white/40 focus:border-white focus:bg-white/10 disabled:opacity-60";

export default function ContactSection() {
  const { contact, profile } = usePortfolio();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (status !== "sending") {
      setStatus("idle");
      setError("");
    }
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.mobileNumber.trim() || !form.message.trim()) {
      setStatus("error");
      setError("Fill in your name, mobile number and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus("error");
      setError("Enter an email address I can reply to, like you@example.com.");
      return;
    }

    setStatus("sending");
    setError("");

    const body = new FormData();
    for (const [field, entry] of Object.entries(FORM_FIELDS)) {
      body.append(entry, form[field as keyof FormState]);
    }

    try {
      await fetch(FORM_ACTION, { method: "POST", mode: "no-cors", body });
      setStatus("sent");
      setForm(EMPTY);
    } catch {
      setStatus("error");
      setError(`The message could not be sent. Check your connection, or email ${contact.email} instead.`);
    }
  };

  const sending = status === "sending";
  const github = safeHref(contact.github, { webOnly: true });
  const linkedin = safeHref(contact.linkedin, { webOnly: true });

  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-ink text-white">
      <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <h2
            id="contact-title"
            className="t-wide max-w-[14ch] text-[2.2rem] font-extrabold leading-[1] tracking-[-0.03em] sm:text-[3.4rem]"
          >
            Have a role or a project in mind?
          </h2>
          <p className="mt-6 max-w-[46ch] text-[1.1rem] text-white/70">
            Email is the fastest way to reach me. I reply within a day.
          </p>

          <a
            href={`mailto:${contact.email}`}
            className="t-wide mt-8 inline-block break-all text-[1.25rem] font-bold underline decoration-amber decoration-[3px] underline-offset-[6px] hover:text-amber sm:text-[1.6rem]"
          >
            {contact.email}
          </a>

          <dl className="m-0 mt-10 max-w-[30rem]">
            {contact.phone && (
              <div className="grid grid-cols-[6.5rem_1fr] gap-4 border-t border-white/20 py-3.5">
                <dt className="t-narrow text-white/60">Phone</dt>
                <dd className="m-0">
                  <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="font-medium hover:text-amber">
                    {contact.phone}
                  </a>
                </dd>
              </div>
            )}
            <div className="grid grid-cols-[6.5rem_1fr] gap-4 border-t border-white/20 py-3.5">
              <dt className="t-narrow text-white/60">Location</dt>
              <dd className="m-0 font-medium">{profile.location}</dd>
            </div>
            <div className="grid grid-cols-[6.5rem_1fr] gap-4 border-y border-white/20 py-3.5">
              <dt className="t-narrow text-white/60">Elsewhere</dt>
              <dd className="m-0 flex flex-wrap gap-x-6 gap-y-2 font-medium">
                {github && (
                  <a href={github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-amber">
                    <FiGithub size={16} aria-hidden />
                    GitHub
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-amber">
                    <FiLinkedin size={16} aria-hidden />
                    LinkedIn
                  </a>
                )}
              </dd>
            </div>
          </dl>

          <p className="mt-8 text-white/70">
            Prefer to talk?{" "}
            <button
              type="button"
              onClick={() => askAssistant("Schedule an interview")}
              className="font-semibold text-white underline decoration-amber decoration-2 underline-offset-4 hover:text-amber"
            >
              Book a 30-minute call
            </button>
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="lg:col-span-6 lg:pl-8">
          <h3 className="t-wide text-[1.3rem] font-bold">Send a message</h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="block text-[0.95rem] font-medium">
              Name
              <input name="name" value={form.name} onChange={onChange} disabled={sending} autoComplete="name" required className={fieldClass} />
            </label>
            <label className="block text-[0.95rem] font-medium">
              Email
              <input name="email" type="email" value={form.email} onChange={onChange} disabled={sending} autoComplete="email" required placeholder="you@example.com" className={fieldClass} />
            </label>
            <label className="block text-[0.95rem] font-medium sm:col-span-2">
              Mobile number
              <input name="mobileNumber" type="tel" value={form.mobileNumber} onChange={onChange} disabled={sending} autoComplete="tel" required className={fieldClass} />
            </label>
            <label className="block text-[0.95rem] font-medium sm:col-span-2">
              Message
              <textarea name="message" rows={5} value={form.message} onChange={onChange} disabled={sending} required placeholder="What are you working on?" className={`${fieldClass} resize-y`} />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button type="submit" disabled={sending} className={`${buttonStyles.onInk} disabled:opacity-60`}>
              {sending ? "Sending" : "Send message"}
            </button>
            <p role="status" aria-live="polite" className="m-0 text-[0.95rem]">
              {status === "sent" && <span className="font-semibold text-white">Message sent. I will reply by email.</span>}
              {status === "error" && <span className="font-semibold text-amber">{error}</span>}
            </p>
          </div>
        </form>
      </Container>
    </section>
  );
}
