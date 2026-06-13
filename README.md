# Mandeep Singh Portfolio

A production-oriented AI portfolio built with Next.js 16, React 19, TypeScript,
Tailwind CSS 4, Framer Motion, Three.js, Gemini, Upstash Redis, and Vercel Blob.

## Features

- Responsive animated portfolio with projects, skills, experience, and education
- Floating "Mandeep AI" assistant with streaming responses
- Grounded portfolio retrieval and structured tool calling
- Project, resume, contact, and Calendly result cards
- Session-scoped chat history, retry, stop generation, and Markdown rendering
- Protected `/admin` content editor with server-side validation
- Persistent production content through Upstash Redis
- PDF resume uploads through Vercel Blob
- Local retrieval and content fallbacks for development

## Local Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The assistant works without Gemini by returning
extractive answers from the portfolio knowledge base. Add `GEMINI_API_KEY` for
model-based tool selection and grounded natural-language responses.

## Knowledge Base

Seed content lives in `data/portfolio/`:

- `profile.json`
- `contact.json`
- `projects.json`
- `skills.json`
- `education.json`
- `experience.json`
- `certifications.json`

The visible portfolio and AI assistant use the same typed content model. In
development, admin changes persist for the current server process. In
production, configure Upstash so changes survive deployments and restarts.

## Admin

Configure:

```text
ADMIN_EMAIL=
ADMIN_PASSWORD=
AUTH_SECRET=
```

`AUTH_SECRET` must contain at least 32 characters. Visit `/admin`, sign in, and
edit a section using validated JSON. Every admin API route independently checks
the signed HttpOnly session.

For persistent production edits, configure:

```text
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

For resume uploads, create a Vercel Blob store and configure:

```text
BLOB_READ_WRITE_TOKEN=
```

Only PDF files up to 5 MB are accepted.

## AI Configuration

```text
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_CALENDLY_URL=
NEXT_PUBLIC_SITE_URL=
```

`GEMINI_API_KEY` is used only in server modules. The chat API validates request
size, limits recent history, applies per-instance rate limits, and streams
newline-delimited JSON through the Web Streams API.

The local retriever tokenizes portfolio records and applies cosine similarity
with a relevance threshold. Gemini receives only the retrieved records and is
instructed to use the exact missing-information fallback when context is
insufficient.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Deployment

Deploy as a Node.js Next.js application, such as on Vercel. Add all required
environment variables in the deployment dashboard. Do not use static export:
chat streaming, admin authentication, persistence, and uploads require Route
Handlers running on a server runtime.

Upstash REST rate limiting can be added for globally consistent limits across
server instances. The included limiter is intentionally dependency-free and
operates per server instance.
