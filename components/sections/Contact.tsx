"use client";

import { useCallback, useState } from "react";
import type {
  ChangeEvent,
  ComponentType,
  FormEvent,
  ReactNode,
} from "react";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

import { useInView } from "react-intersection-observer";

import {
  ArrowUpRight,
  CheckCircle,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

import {
  FiGithub as Github,
  FiLinkedin as Linkedin,
} from "react-icons/fi";

import { PERSONAL } from "@/lib/data";

type Status =
  | "idle"
  | "sending"
  | "sent"
  | "error";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FieldName = keyof FormState;

type ContactCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
  tone?: "primary" | "accent" | "secondary";
};

type SocialCardProps = {
  icon: ComponentType<{
    size?: number;
    className?: string;
  }>;
  label: string;
  value: string;
  href: string;
};

type FormFieldProps = {
  label: string;
  name: FieldName;
  value: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  disabled?: boolean;
  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => void;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const SOCIALS = [
  {
    icon: Github,
    label: "GitHub",
    value: "Mandeep-vivu",
    href: PERSONAL.github,
  },

  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "vivansingh-mandeep",
    href: PERSONAL.linkedin,
  },

  {
    icon: Mail,
    label: "Email",
    value: PERSONAL.email,
    href: `mailto:${PERSONAL.email}`,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.42,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const panelClass = "surface-panel";

const fieldClass =
  "w-full rounded-lg border border-white/8 bg-white/[0.025] px-3.5 py-2.5 text-[0.82rem] text-white outline-none transition-all duration-300 placeholder:text-slate-600 focus:border-primary focus:bg-white/[0.04] focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60";

function ContactCard({
  icon,
  label,
  value,
  href,
  tone = "primary",
}: ContactCardProps) {
  const toneClass = {
    primary:
      "text-primary bg-primary/10",

    accent:
      "text-accent bg-accent/10",

    secondary:
      "text-secondary bg-secondary/10",
  }[tone];

  const content = (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      className="group flex items-center gap-2.5 rounded-lg border border-white/8 bg-white/[0.025] p-3 transition-all duration-300 hover:border-primary/20 hover:bg-white/[0.045]"
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClass}`}
      >
        {icon}
      </span>

      <span className="min-w-0">
        <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>

        <span className="mt-0.5 block truncate text-[0.82rem] font-medium text-slate-200 transition-colors group-hover:text-white">
          {value}
        </span>
      </span>
    </motion.div>
  );

  if (!href) return content;

  return (
    <a
      href={href}
      className="block"
      target={
        href.startsWith("http")
          ? "_blank"
          : undefined
      }
      rel="noopener noreferrer"
    >
      {content}
    </a>
  );
}

function SocialCard({
  icon: Icon,
  label,
  value,
  href,
}: SocialCardProps) {
  return (
    <motion.a
      variants={itemVariants}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      href={href}
      target={
        href.startsWith("http")
          ? "_blank"
          : undefined
      }
      rel="noopener noreferrer"
      className="group flex min-h-[68px] items-center gap-2.5 rounded-lg border border-white/8 bg-white/[0.025] p-3 transition-all duration-300 hover:border-primary/25 hover:bg-white/[0.05]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-slate-300 transition-colors group-hover:text-primary">
        <Icon size={15} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>

        <span className="mt-0.5 block truncate text-[0.8rem] font-medium text-slate-200 transition-colors group-hover:text-white">
          {value}
        </span>
      </span>

      <ArrowUpRight
        size={13}
        className="shrink-0 text-slate-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
      />
    </motion.a>
  );
}

function FormField({
  label,
  name,
  value,
  placeholder,
  required = false,
  type = "text",
  textarea = false,
  disabled = false,
  onChange,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-slate-400">
        {label}

        {required && (
          <span className="text-primary">
            {" "}
            *
          </span>
        )}
      </span>

      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          rows={5}
          placeholder={placeholder}
          className={`${fieldClass} min-h-[118px] resize-none leading-6`}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={fieldClass}
        />
      )}
    </label>
  );
}

export default function Contact() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.12,
  });

  const [form, setForm] =
    useState<FormState>(INITIAL_FORM);

  const [status, setStatus] =
    useState<Status>("idle");

  const isSending =
    status === "sending";

  const handleChange = useCallback(
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } =
        event.target;

      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setStatus("sending");

      await new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );

      window.location.href = `mailto:${PERSONAL.email}?subject=${encodeURIComponent(
        form.subject
      )}&body=${encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
      )}`;

      setStatus("sent");

      setForm(INITIAL_FORM);

      setTimeout(
        () => setStatus("idle"),
        3500
      );
    },
    [form]
  );

  return (
    <section
      id="contact"
      className="min-h-[calc(100vh-64px)] flex flex-col justify-center relative overflow-hidden px-4 pt-5 pb-14 sm:px-5 lg:px-6 lg:pt-7 lg:pb-16"
    >
      {/* top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      {/* glows */}
      <div className="pointer-events-none absolute left-1/2 top-14 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-primary/8 blur-[110px]" />

      <div className="pointer-events-none absolute bottom-8 right-0 h-[220px] w-[220px] rounded-full bg-accent/5 blur-[90px]" />

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={
          inView
            ? "visible"
            : "hidden"
        }
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center"
      >
        {/* heading */}
        <motion.div
          variants={itemVariants}
          className="mx-auto mb-7 max-w-2xl text-center"
        >
          <div className="mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary/80" />

            <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-primary">
              Contact
            </span>

            <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary/80" />
          </div>

          <h2 className="font-display text-3xl font-black leading-[1.02] text-white sm:text-4xl lg:text-5xl">
            Let&apos;s Build{" "}
            <span className="gradient-text">
              Together
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-[0.88rem] leading-6 text-slate-400">
            Open to AI/ML roles,
            collaborations, and useful
            product conversations.
          </p>
        </motion.div>

        {/* layout */}
        <div className="grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-5 lg:gap-5">
          {/* left */}
          <motion.aside
            variants={itemVariants}
            className={`${panelClass} p-4 sm:p-5 lg:col-span-2`}
          >
            {/* availability */}
            <div className="mb-4 rounded-lg border border-emerald-400/12 bg-emerald-400/[0.05] p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <span className="text-[0.8rem] font-semibold text-emerald-300">
                  Available for Opportunities
                </span>
              </div>

              <p className="text-[0.78rem] leading-5 text-slate-400">
                Open to AI/ML,
                full-stack, and internship
                roles.
              </p>
            </div>

            {/* intro */}
            <div className="mb-4">
              <h3 className="font-display text-[1.1rem] font-bold text-white">
                Get In Touch
              </h3>

              <p className="mt-1.5 text-[0.8rem] leading-5 text-slate-400">
                Fastest response through
                email.
              </p>
            </div>

            {/* contact */}
            <div className="space-y-2 border-y border-white/8 py-3">
              <ContactCard
                icon={<Mail size={16} />}
                label="Email"
                value={PERSONAL.email}
                href={`mailto:${PERSONAL.email}`}
              />

              <ContactCard
                icon={<Phone size={16} />}
                label="Phone"
                value={PERSONAL.phone}
                tone="accent"
              />

              <ContactCard
                icon={<MapPin size={16} />}
                label="Location"
                value={PERSONAL.location}
                tone="secondary"
              />
            </div>

            {/* socials */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Socials
                </p>

                <span className="ml-3 h-px flex-1 bg-white/8" />
              </div>

              <div className="grid grid-cols-1 gap-2">
                {SOCIALS.map((social) => (
                  <SocialCard
                    key={social.label}
                    {...social}
                  />
                ))}
              </div>
            </div>
          </motion.aside>

          {/* form */}
          <motion.div
            variants={itemVariants}
            className={`${panelClass} p-4 sm:p-5 lg:col-span-3 lg:p-5`}
          >
            {status === "sent" ? (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.96,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="flex min-h-[320px] flex-col items-center justify-center text-center"
              >
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-300">
                  <CheckCircle size={28} />
                </span>

                <h3 className="font-display text-[1.35rem] font-bold text-white">
                  Message Sent
                </h3>

                <p className="mt-2 max-w-sm text-[0.82rem] leading-5 text-slate-400">
                  Thanks for reaching out.
                  I&apos;ll get back soon.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* top */}
                <div className="mb-4">
                  <h3 className="font-display text-[1.3rem] font-bold text-white">
                    Start a Conversation
                  </h3>

                  <p className="mt-1.5 max-w-lg text-[0.82rem] leading-5 text-slate-400">
                    Share a few details and
                    I&apos;ll reply with the
                    next step.
                  </p>
                </div>

                {/* row */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={isSending}
                    placeholder="Your name"
                  />

                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={isSending}
                    placeholder="you@example.com"
                  />
                </div>

                <FormField
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  disabled={isSending}
                  placeholder="Project or role"
                />

                <FormField
                  label="Message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  textarea
                  disabled={isSending}
                  placeholder="Tell me what you are building..."
                />

                {/* button */}
                <motion.button
                  type="submit"
                  disabled={isSending}
                  {...(!isSending && {
                    whileHover: { y: -1 },
                    whileTap: { scale: 0.985 },
                  })}
                  className="group relative mt-1 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-primary/25 bg-gradient-to-r from-primary via-secondary to-accent px-5 py-3 text-[0.82rem] font-semibold text-white shadow-[0_0_28px_rgba(99,102,241,0.2)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(99,102,241,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative z-10 flex items-center gap-2">
                    {isSending ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Sending
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </span>
                </motion.button>

                <p className="pt-0.5 text-center font-mono text-[0.62rem] text-slate-600">
                  {"// response within 24 hours"}
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}