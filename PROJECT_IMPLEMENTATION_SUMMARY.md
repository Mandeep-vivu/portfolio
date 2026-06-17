# Portfolio Repository Implementation Summary

## 1. Project Overview

This repository implements a personal AI-powered portfolio website for Mandeep Singh.
The application is built with:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Three.js
- Gemini / OpenAI / Groq AI integrations
- Upstash Redis persistence
- Vercel Blob uploads

The application displays portfolio sections, provides an AI chat assistant, and exposes an admin content editor.

## 2. Key Features

- Responsive portfolio front-end with animated sections
- AI chat assistant for portfolio exploration
- Portfolio retrieval with local search and optional vector search
- GitHub repository sync to build project cards
- AI-based project intelligence generation
- Admin content editing with JSON validation and persistence
- Resume upload via Vercel Blob storage
- Upstash Redis persistent production content storage
- Simple stateless admin session authentication
- Rate limiting for chat and admin login endpoints

## 3. Main Scripts

- `npm run dev` → start Next.js development server
- `npm run build` → build production app
- `npm run start` → start built app
- `npm run lint` → run ESLint
- `npm run test` → run Vitest tests
- `npm run typecheck` → run TypeScript type checking
- `npm run generate-embeddings` → generate `data/portfolio/vector_store.json`
- `npm run sync-github` → sync GitHub repos into `data/projects.json`

## 4. Data and Content Architecture

### Seed content

Seed content lives in `data/portfolio/`:
- `profile.json`
- `contact.json`
- `projects.json`
- `skills.json`
- `education.json`
- `experience.json`
- `certifications.json`

### Runtime portfolio data

- `lib/portfolio/seed.ts` imports `data/projects.json` and other JSON files as `seedPortfolio`
- `lib/portfolio/repository.ts` implements `getPortfolio()` and `savePortfolio()`
- `getPortfolio()` returns:
  - Upstash-stored portfolio if configured
  - otherwise in-memory portfolio during development
  - otherwise `seedPortfolio`

### Portfolio schema and validation

- `lib/portfolio/schemas.ts` defines Zod schemas for:
  - profile
  - contact
  - projects
  - skills
  - education
  - experience
  - certifications
- `sectionSchemas` validate individual portfolio sections for admin updates

### Portfolio types

- `lib/portfolio/types.ts` defines the typed model used by the frontend and backend
- `Project` includes both GitHub/project fields and intelligence fields

## 5. GitHub Synchronization Implementation

### Offline sync script workflow

`scripts/sync-github.ts` executes the following workflow:

**Step 1: Environment Setup**
- Reads `GITHUB_USERNAME` (default: 'Mandeep-vivu') and optional `GITHUB_TOKEN`
- Reads `GEMINI_API_KEY` for AI-based project analysis
- Sets up file paths for cache and output

**Step 2: GitHub API Fetch**
- Queries `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`
- If `GITHUB_TOKEN` is present, includes `Authorization: token ${GITHUB_TOKEN}` header
  - Allows 60 requests/hour (vs 10 without auth)
  - Enables access to private repos if needed
- Parses JSON response into repo array

**Step 3: README Retrieval**
- For each repository:
  - Attempts fetch from `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/main/README.md`
  - Falls back to `master` branch if main branch not found
  - Stores README content in memory for intelligence analysis

**Step 4: Metadata Preservation**
- Loads old metadata from `data/portfolio/projects.json` if exists
- Loads current cache metadata from `data/projects.json`
- Creates map of repo name → custom metadata:
  - title, longDesc, gradient, icon, featured status
  - custom demo URL, custom tech array
  - Previously generated intelligence fields
- This ensures edits made in admin UI or custom JSON aren't lost during re-sync

**Step 5: Outdated Check**
- For each repo, determines if needs fresh intelligence generation:
  - `customMeta.updatedAt !== repo.updated_at` (GitHub updated file)
  - OR `!customMeta.recruiterSummary` (missing intelligence)
- If outdated, fetches README and generates intelligence
- If unchanged, reuses cached intelligence fields

**Step 6: Intelligence Generation**
Two paths based on `GEMINI_API_KEY`:

**Path A: AI-Powered Intelligence (if GEMINI_API_KEY exists and README is readable)**
- Calls Gemini 2.5 Flash with prompt:
  ```
  Analyze the following GitHub repository metadata and README file:
  Repository Name: ${repo.name}
  Description: ${repo.description}
  Languages/Topics: ...
  README: ${readmeContent.substring(0, 12000)}
  ```
- Uses Zod schema `projectIntelligenceSchema` to enforce structured output
- Generates:
  - `category`: ML, NLP, Computer Vision, Generative AI, Full Stack, etc.
  - `difficulty`: Beginner, Intermediate, Advanced, Expert
  - `skillsDemonstrated`: [Python, React, TensorFlow, ...]
  - `keyFeatures`: [feature1, feature2, ...]
  - `recruiterSummary`: 3-5 line professional summary
  - `problemSolved`: what real-world problem it solves
  - `industryUseCase`: Healthcare, Finance, Education, etc.
  - `projectType`: Research, Production, Portfolio, Academic, etc.
  - `aiRelated`: boolean for AI/ML projects
  - `technologies`: full tech stack
  - `learningOutcomes`: what was learned
  - `resumeWorthiness`: 1-100 recruiter impact score
  - `complexityScore`: 1-100 engineering complexity

**Path B: Rule-Based Fallback (if Gemini unavailable or README < 10 chars)**
- Tokenizes README + description + repo name into lowercase
- Applies heuristic rules for categorization:
  - Detects AI keywords (TensorFlow, PyTorch, ML, NLP, etc.) → AI-related flag
  - Matches tech stack from tokens → category classification
  - Calculates complexity from repo size, topic count, stars
  - Assigns difficulty based on complexity factor
  - Extracts skills from known tech libraries
  - Generates fallback recruiterSummary from detected skills and category

**Step 7: Project Object Assembly**
For each repo, creates normalized `Project` object:
```typescript
{
  id: repo.name,
  name: repo.name,
  description: repo.description || '',
  language: repo.language,
  topics: repo.topics,
  stars: repo.stargazers_count,
  forks: repo.forks_count,
  githubUrl: repo.html_url,
  demoUrl: repo.homepage || customMeta.demoUrl,
  updatedAt: repo.updated_at,
  readmeSummary: intelligence.recruiterSummary.substring(0, 180) + "...",
  
  // Custom metadata (preserved or defaults)
  title: customMeta.title || repo.name,
  gradient: customMeta.gradient || randomGradient(),
  icon: customMeta.icon || (intelligence.aiRelated ? 'ML' : 'CODE'),
  featured: customMeta.featured || (intelligence.resumeWorthiness >= 75),
  
  // Intelligence layer
  category: intelligence.category,
  difficulty: intelligence.difficulty,
  recruiterSummary: intelligence.recruiterSummary,
  ...
}
```

**Step 8: Local File Write**
- Writes array of all projects to `data/projects.json`
- Format: JSON with 2-space indentation (human-readable)
- Logs: "Successfully synced and saved ${projects.length} projects"

**Step 9: Upstash Redis Update (if configured)**
- Checks if `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` exist
- If yes:
  - Makes REST call: `GET portfolio:content:v1`
  - Parses stored JSON as `portfolioData`
  - Updates ONLY `portfolioData.projects` with new projects array
  - Makes REST call: `SET portfolio:content:v1 ${JSON.stringify(portfolioData)}`
  - Preserves other portfolio sections (profile, skills, education, etc.)
- If no, skips Redis sync (development mode)

### Output structure

Each synced project now has:
- Base GitHub fields: name, description, language, topics, stars, forks, githubUrl
- Custom/display fields: title, gradient, icon, featured status, demo URL
- Intelligence fields: category, difficulty, skillsDemonstrated, recruiterSummary, complexityScore, resumeWorthiness
- Metadata: readmeSummary, projectType, industryUseCase, aiRelated

### Important architectural note

- The app does **NOT** directly query GitHub at runtime
- GitHub sync is a **build/deployment step**, not a runtime operation
- Frontend receives **static project data** from seeded JSON or Redis, never from GitHub API
- This ensures: fast page loads, predictable data, protection against GitHub API rate limits

## 6. AI and Chat Implementation

### Frontend AI chat component workflow

`components/ai/AIChat.tsx` implements a full chat UI with the following flow:

**Initialization**
- Loads saved session from `sessionStorage` (key: `mandeep-ai-chat-v1`)
- Stores: `{ messages, suggestions, memory }`
- Falls back to default welcome message if no session exists
- Sets default suggestions: "Tell me about Mandeep", "What AI projects has he built?", etc.

**User Input Submission**
1. User types in textarea and presses Enter or clicks Send
2. Input is trimmed and validated (not empty, not generating)
3. New user message created with UUID
4. History filtered to exclude pending/error/thinking messages, limited to last 10
5. Assistant message placeholder added with pending state
6. Request payload built:
   ```json
   {
     "messages": [...history with new user message],
     "memory": {...conversationMemory}
   }
   ```
7. Abort controller set for cancellation support
8. POST request sent to `/api/chat` with streaming body

**Response Streaming**
- Opens ReadableStream on response body
- Decodes `uint8` chunks into UTF-8 text
- Buffers until complete newline found (newline-delimited JSON)
- Parses each line as JSON and validates as `StreamEvent`
- Dispatches based on `event` type:
  - `thinking`: renders thinking indicator
  - `blocks`: renders project cards, contact info, resume links, etc.
  - `delta`: appends text chunk to message
  - `memory`: updates conversation memory
  - `suggestions`: refreshes suggestion chips
  - `done`: marks message complete
  - `error`: renders error block

**Session Persistence**
- After each message or suggestion change, saves to `sessionStorage`
- Auto-scroll to bottom when new message arrives
- Keyboard support: Escape to close, Enter to submit

**UI Features**
- Message rendering with markdown support
- Retry button to regenerate last response
- Stop generation button (aborts fetch)
- Clear chat button (resets to welcome)
- Collapsible chat window
- Mobile body overflow handling

### Chat API route detailed flow

`app/api/chat/route.ts` processes user input with sophisticated routing:

**Request Validation & Rate Limiting**
```typescript
const identity = requestIdentity(request); // Extract IP or x-forwarded-for
const limit = rateLimit(`chat:${identity}`, 20, 60_000); // 20 requests per 60 seconds
if (!limit.allowed) return 429 error with Retry-After header
```

**Request Parsing**
- Validates incoming JSON against `chatRequestSchema`
- Extracts: `messages[]` and optional `memory`
- Initializes response stream with `ReadableStream`

**Intent Routing (Local Responses)**

The API inspects the last user message and routes to appropriate handler:

**Route 1: Greetings**
- Pattern: `/^(hi|hello|hey|greetings|...)(\s|$)/`
- Response: Simple greeting text block without AI
- Use case: No retrieval needed, instant friendly response

**Route 2: Resume Request**
- Pattern: `/resume|cv|download resume|download cv/`
- Logic:
  - Calls `getPortfolio()`
  - Extracts `portfolio.profile.resumeUrl`
  - Returns: `{ type: "resume_link", url, title }`
- Use case: Direct resume download without AI interpretation

**Route 3: Contact Request**
- Pattern: `/contact|email|github|linkedin|phone number/`
- Logic:
  - Calls `getPortfolio()`
  - Extracts contact section
  - Returns: `{ type: "contact", email, phone, linkedin, github, portfolioUrl }`
- Use case: Contact information needs no AI reasoning

**Route 4: Scheduling Request**
- Pattern: `/schedule|book interview|book meeting|calendly/`
- Logic:
  - Checks `NEXT_PUBLIC_CALENDLY_URL` env variable
  - Returns: `{ type: "schedule", url }`
- Use case: Scheduling links are static

**Route 5: FAQ Questions**
- Pattern: `/what are his skills|what is his education|tell me about his experience/`
- Logic:
  - Calls `getPortfolio()`
  - Calls `retrieveHybridContext(message, portfolio, 4)`
  - Builds text block from matched results
  - Adds project cards if projects matched
- Use case: Structured questions with portfolio data, minimal LLM needed

**Route 6: Complex Query (LLM Path)**
- Triggers for all other queries
- Requires `GEMINI_API_KEY` or fallback model
- Execution:
  1. Resolve local references from conversation memory
  2. Call `retrieveHybridContext(resolvedQuery, portfolio, 5)`
  3. Build system prompt with grounded answer instructions + portfolio context + memory
  4. Call `generateObject()` with `singleTurnResponseSchema`
  5. Gemini returns structured response: intent, confidence, needsClarification, response
  6. If Gemini fails (quota):
     - Falls back to Groq LLaMA model if configured
     - If Groq also fails, renders hybrid retrieval results as fallback text
  7. Streams response blocks

**Error Handling & Fallbacks**
```
LLM Call
  ↓ (Success) → Render structured response
  ↓ (API Error & Quota) 
  → Try Groq fallback
    ↓ (Success) → Render Groq response
    ↓ (Failure) → Render hybrid retrieval as text
```

**Stream Event Emission**
After response generation, sends events:
```
1. "thinking" → shows AI is reasoning
2. "blocks" → structured UI components (cards, links, contact)
3. "memory" → updated conversation memory
4. "suggestions" → next prompt suggestions
5. "done" → marks response complete
```

### Hybrid retrieval deep dive

`lib/ai/hybrid.ts` combines two retrieval strategies:

**Phase 1: Local Document Search**
```typescript
const knowledgeDocs = buildKnowledgeDocuments(portfolio);
// Enriches project docs with readmeSummary
const localResults = retrieveDocuments(query, enrichedDocs, 10);
```
- Scores all portfolio documents (profile, projects, skills, education, experience, certifications)
- Returns top 10 results

**Phase 2: Vector Search (Optional)**
```typescript
try {
  const rag = await retrieveRAGContext(query, 5);
  vectorResults = rag.chunks || [];
} catch (error) {
  console.warn("Vector search failed, falling back to pure local search");
}
```
- Loads `data/portfolio/vector_store.json` (if exists)
- Embeds query using same model (OpenAI or Gemini)
- Computes cosine similarity with all chunk embeddings
- Returns top 5 vector results
- Gracefully degrades if vector store unavailable

**Phase 3: Merge & Score**
- Creates merged map: `id → { localScore, vectorScore }`
- Local results given 85% weight, vector 15%
- Final score: `(localScore * 0.85) + (vectorScore * 0.15)`
- Sorts by final score, limits to requested count (default 5)

**Phase 4: Context Building**
- Iterates merged results and categorizes:
  - `category === "project"` → add to `matchedProjects`
  - `category === "skill"` → add to `matchedSkills`
  - `category === "experience"` → add to `matchedExperience`
  - All others → add to `semanticMatches`
- Enrich project results with full project object (title, description, GitHub URL, intelligence fields)
- Confidence = highest score in top results

### Local retrieval algorithm

`lib/ai/retrieval.ts` implements sophisticated document ranking:

**Document Preparation**
- Tokenizes: `value.toLowerCase().replace(/[^a-z0-9+#.\-]+/g, " ").split(/\s+/)`
- Filters: removes tokens < 2 chars and stop words (a, the, and, etc.)
- Builds synonym map for domain terms:
  - `coding → programming, development, software`
  - `backend → server, database, api, postgresql`
  - `ai → machine learning, ml, deep learning`
  - etc. (200+ synonyms)
- Tokenizes query and expands with synonyms
- Generates bigrams (two-word phrases)

**Scoring Signals (Multi-Signal Approach)**

For each document, computes 5 independent signals:

**Signal 1: TF-IDF Cosine Similarity (40% weight)**
- Computes term frequency in query and document
- Computes inverse document frequency across all documents
- Calculates TF-IDF vectors
- Computes cosine similarity between vectors
- Score: 0.0-1.0

**Signal 2: Title Exact Matches (22% weight)**
- Counts raw query tokens that appear in title
- Example: query "react projects" matches title "React Dashboard" → +2 exact matches
- Score: count of matches

**Signal 3: Bigram Matches (18% weight)**
- Generates bigrams from query (two consecutive tokens)
- Counts bigrams that appear in document
- Example: query "python machine learning" → bigram "python machine" matches doc
- Score: count of bigram matches

**Signal 4: Fuzzy Matching (12% weight)**
- For query tokens with 4+ characters
- Computes Levenshtein distance to document tokens
- Allows 1 edit for 4-6 char words, 2 edits for 7+ char words
- Example: query "computr" matches doc "computer" (1 edit)
- Score: similarity (1 - distance/maxLen)

**Signal 5: Category Boost**
- Inspects query tokens for category signals:
  - `project → +0.15 per match if doc.category === "project"`
  - `skill → +0.15 per match if doc.category === "skill"`
  - `education → +0.15 per match if doc.category === "education"`
  - etc.
- Multiplies raw score by boost factor

**Final Ranking**
```
rawScore = (tfidfScore * 0.40) + (exactMatches * 0.22) + (bigramMatches * 0.18) + (fuzzyScore * 0.12)
finalScore = rawScore * categoryBoost
Filter: only include if finalScore >= 0.06
Sort: descending by score
Limit: return top N results
```

**Example Scoring**
Query: "What AI projects has he built?"
- Tokens after filtering: [ai, projects]
- Expanded: [ai, artificial intelligence, machine learning, ml, deep learning, projects, ...]
- Document "TensorFlow Computer Vision": category=project
  - TF-IDF: 0.65 (high relevance)
  - Title exact: 1 ("projects" in description)
  - Bigrams: 0 (no "ai projects" bigram)
  - Fuzzy: 0.3 (AI ≈ neural via levenshtein)
  - Category boost: 1.15
  - RawScore: (0.65 * 0.40) + (1 * 0.22) + (0 * 0.18) + (0.3 * 0.12) = 0.635
  - FinalScore: 0.635 * 1.15 = 0.731 ✓ ranked high

### Vector retrieval (RAG) implementation

`lib/ai/rag.ts` provides semantic search:

**Embedding Model Selection**
```typescript
if (process.env.OPENAI_API_KEY) {
  return openai.textEmbeddingModel("text-embedding-3-small"); // 1536 dimensions
} else if (process.env.GEMINI_API_KEY) {
  return google.textEmbeddingModel("gemini-embedding-2"); // embedding model
}
```

**Query Embedding & Similarity**
1. Receive user query string
2. Call embedding model to get query vector (e.g., 1536-dim)
3. Load vector store chunks from JSON
4. For each chunk, compute cosine similarity:
   ```
   similarity = (dotProduct) / (norm_A * norm_B)
   where dotProduct = sum(queryVec[i] * chunkVec[i])
   norm_A = sqrt(sum(queryVec[i]^2))
   norm_B = sqrt(sum(chunkVec[i]^2))
   ```
5. Score is 0.0-1.0 (1.0 = identical, 0.0 = orthogonal)
6. Sort by score, return top K with confidence = highest score

**Vector Store Structure**
Each chunk in `data/portfolio/vector_store.json`:
```json
{
  "id": "project-portfolio",
  "type": "project",
  "title": "Portfolio Website",
  "content": "Full text content for embedding",
  "metadata": { "source": "projects.json", "projectId": "portfolio" },
  "embedding": [0.123, -0.456, ..., 0.789] // 1536 floats
}
```

### Embedding generation workflow

`scripts/generate-embeddings.ts` creates the vector store:

**Data Chunking**
1. Profile chunk: name + tagline + bio + location + roles + stats
2. Project chunks (one per project):
   - Title, description, longDesc, category, difficulty, recruiter summary
   - Problem solved, technology stack, skills, features
   - Complexity/worthiness scores
3. Skill category chunks: by category (AI, Full Stack, Tools)
4. Education chunks (one per entry): title, org, year, description
5. Experience chunks (one per entry): title, org, year, description
6. Certification chunks (one per entry): title, type, description

Total: ~15-50 chunks depending on portfolio size

**Embedding Computation**
- For each chunk, calls embedding API
- Stores result in `chunk.embedding` array
- Logs progress: "Embedded chunk N/total"
- Takes ~10-30 seconds depending on chunk count and model

**Output**
- Writes `data/portfolio/vector_store.json`
- Format: JSON array of chunks with embeddings
- Size: ~500KB-2MB depending on content length and embedding dimensions

## 7. Admin and Content Editing

### Admin UI flow (`app/admin/page.tsx`)

**Initialization**
1. Check admin session via `/api/admin/session` GET
2. If authenticated, load portfolio from `/api/admin/content` GET
3. If not authenticated, show login form
4. If not configured, show warning about missing env vars

**Login Flow**
1. User enters email and password
2. Form POST to `/api/admin/session`
3. Server rate-limits (5 attempts per 5 minutes)
4. Validates credentials against `ADMIN_EMAIL` and `ADMIN_PASSWORD`
5. If valid, calls `createAdminSession()` which:
   - Creates signed HttpOnly cookie
   - Payload: `base64url(JSON.stringify({ email, expiresAt }))`
   - Signature: `HMAC-SHA256(payload, AUTH_SECRET)`
   - Value stored: `${payload}.${signature}`
   - Expires: 8 hours (SESSION_SECONDS = 28800)
6. On success, client fetches portfolio data

**Content Editing Workflow**
1. User selects section from sidebar (profile, contact, projects, skills, education, experience, certifications)
2. JSON for selected section loads into monaco editor
3. User edits JSON
4. User clicks "Save"
5. Client sends PUT to `/api/admin/content`:
   ```json
   {
     "section": "projects",
     "value": [ ...edited array... ]
   }
   ```
6. Server validates:
   - Checks admin session
   - Parses JSON
   - Validates against Zod `sectionSchemas[section]`
   - Returns 400 if validation fails
7. Server updates:
   - Calls `updatePortfolioSection(section, value)`
   - Saves to Redis or memory
   - Returns updated full portfolio
8. Client displays success message: "Saved. The portfolio API and AI knowledge are updated."
9. Home page automatically revalidates

**Resume Upload Flow**
1. User selects PDF file in upload form
2. Form POSTs to `/api/admin/resume` with multipart/form-data
3. Server validates:
   - File must be PDF (type check)
   - File size ≤ 5MB
4. Server uploads to Vercel Blob:
   - Path: `resumes/mandeep-singh-${Date.now()}.pdf`
   - Access: public
5. Server updates portfolio:
   - Gets current portfolio
   - Sets `profile.resumeUrl = blob.url`
   - Saves to Redis or memory
6. Server revalidates home page
7. Client displays upload success with blob URL

**Reindex Flow**
1. User clicks "Refresh index" button
2. POST to `/api/admin/reindex`
3. Server calls `buildKnowledgeDocuments(portfolio)`
4. Returns count: `{ indexed: N, message: "..." }`
5. Client shows: "Retrieval index refreshed from N records"
6. Note: Local retrieval index regenerates from live portfolio data on each server instance

### Admin authentication implementation

`lib/admin/auth.ts` implements secure admin sessions:

**Configuration Check**
```typescript
adminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD &&
    secret().length >= 32 // AUTH_SECRET >= 32 chars
  );
}
```

**Credential Verification**
```typescript
verifyAdminCredentials(email, password) {
  return (
    adminAuthConfigured() &&
    timingSafeEqual(email.toLowerCase(), ADMIN_EMAIL.toLowerCase()) &&
    timingSafeEqual(password, ADMIN_PASSWORD)
  );
}
```
- Uses `timingSafeEqual` from Node crypto to prevent timing attacks
- Compares buffers, not strings

**Session Creation**
```typescript
createAdminSession(email) {
  expiresAt = Math.floor(Date.now() / 1000) + 28800; // 8 hours
  payload = base64url(JSON.stringify({ email, expiresAt }));
  value = `${payload}.${sign(payload)}`;
  
  cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "strict",
    secure: NODE_ENV === "production",
    path: "/",
    maxAge: 28800
  });
}
```
- HttpOnly prevents XSS cookie theft
- SameSite strict prevents CSRF
- Secure flag only in production (required for HTTPS)

**Session Verification**
```typescript
verifyAdminSession() {
  // 1. Get cookie value
  value = cookies.get(COOKIE_NAME)?.value;
  
  // 2. Split payload and signature
  [payload, signature] = value.split(".");
  
  // 3. Verify signature
  if (!timingSafeEqual(sign(payload), signature)) return false;
  
  // 4. Decode and validate payload
  session = JSON.parse(base64url(payload));
  
  // 5. Check email matches and session not expired
  return (
    session.email === ADMIN_EMAIL &&
    session.expiresAt > Math.floor(Date.now() / 1000)
  );
}
```

**Logout**
```typescript
clearAdminSession() {
  cookies.delete(COOKIE_NAME);
}
```

### Content API routes

**GET /api/admin/content**
```typescript
export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized; // 401 response
  
  return Response.json({
    portfolio: await getPortfolio(),
    storage: getContentStorageMode() // "upstash", "memory", or "readonly"
  });
}
```

**PUT /api/admin/content**
```typescript
export async function PUT(request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized; // 401 response
  
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid content update.", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  
  try {
    const portfolio = await updatePortfolioSection(
      parsed.data.section,
      parsed.data.value
    );
    revalidatePath("/"); // Next.js cache invalidation
    return Response.json({ portfolio });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save content." },
      { status: 400 }
    );
  }
}
```

### Session API route

**GET /api/admin/session**
- Returns `{ authenticated: boolean, configured: boolean }`
- Used by client to check session status on load

**POST /api/admin/session**
- Accepts `{ email, password }`
- Rate limited (5 attempts per 5 minutes)
- Validates credentials
- Creates session on success
- Returns `{ authenticated: true }`

**DELETE /api/admin/session**
- Clears session cookie
- Returns `{ authenticated: false }`

### Resume upload route

**POST /api/admin/resume**
```typescript
export async function POST(request) {
  // 1. Check admin session
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  
  // 2. Check Vercel Blob configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Vercel Blob storage is not configured." },
      { status: 503 }
    );
  }
  
  // 3. Parse multipart form data
  const formData = await request.formData();
  const file = formData.get("resume");
  
  // 4. Validate file
  if (!(file instanceof File)) {
    return Response.json({ error: "A PDF resume is required." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return Response.json({ error: "A PDF resume is required." }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return Response.json(
      { error: "Resume must be 5 MB or smaller." },
      { status: 400 }
    );
  }
  
  // 5. Upload to Vercel Blob
  const blob = await put(
    `resumes/mandeep-singh-${Date.now()}.pdf`,
    file,
    { access: "public", addRandomSuffix: false }
  );
  
  // 6. Update portfolio
  const portfolio = await getPortfolio();
  const nextProfile = { ...portfolio.profile, resumeUrl: blob.url };
  await updatePortfolioSection("profile", nextProfile);
  
  // 7. Revalidate cache
  revalidatePath("/");
  
  return Response.json({ url: blob.url });
}
```

### Reindex route

**POST /api/admin/reindex**
```typescript
export async function POST() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;
  
  const documents = buildKnowledgeDocuments(await getPortfolio());
  return Response.json({
    indexed: documents.length,
    message: "The local retrieval index is generated from current content on each server instance."
  });
}
```
Note: This is informational only. Actual retrieval index is built on-demand for each request.

## 8. Frontend and Layout

### Main page rendering flow (`app/page.tsx`)

**Page Initialization**
```typescript
"use client"; // Client component for state and effects

const [loaded, setLoaded] = useState(false);

// 1. PortfolioProvider wraps entire page
// 2. LoadingScreen shows while loaded === false
// 3. Once loaded, renders all sections
```

**Loading sequence**
1. Page mounts → `<LoadingScreen onComplete={() => setLoaded(true)} />`
2. Loading screen plays animation (typically 2-3 seconds)
3. When animation completes, calls `onComplete()`
4. Sets `loaded = true`
5. LoadingScreen hidden, main content revealed

**Section rendering order**
- Navbar (fixed at top)
- ParticleField (animated background, SSR=false)
- CustomCursor (interactive cursor effect)
- Hero section (name, tagline, social links)
- About section
- Skills section
- Projects section
- Timeline section (education + experience)
- Achievements section
- Contact section
- Footer (fixed at bottom)
- AIChat (floating chat bubble)

### Global data provider (`components/providers/PortfolioProvider.tsx`)

**Context Setup**
```typescript
const PortfolioContext = createContext<PortfolioData>(seedPortfolio);

export function PortfolioProvider({ children }) {
  const [portfolio, setPortfolio] = useState(seedPortfolio); // Start with seed
  
  useEffect(() => {
    const controller = new AbortController();
    
    // Fetch live portfolio from API
    fetch("/api/portfolio", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data) setPortfolio(data); // Update with live data
      })
      .catch(() => undefined); // Stay with seed on error
    
    return () => controller.abort(); // Cleanup
  }, []);
  
  return (
    <PortfolioContext.Provider value={portfolio}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
```

**Data Flow**
```
Initial render: seedPortfolio from JSON
                    ↓
useEffect triggers: fetch("/api/portfolio")
                    ↓
API response: Upstash Redis data OR Redis fallback
                    ↓
setPortfolio(data): Re-render with live data
                    ↓
All child components receive fresh portfolio
```

**Graceful degradation**
- If API fails: components continue using `seedPortfolio`
- If fetch aborts: effect cleanup prevents state update

### Project section component (`components/sections/Projects.tsx`)

**Component Structure**
```typescript
export default function Projects() {
  const { projects } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"updated" | "worthiness" | "complexity">("updated");
  
  // Filtering, sorting, searching logic
  // Renders project cards and analytics
}
```

**Project Card Features**
Each card displays:
- **Header**: Icon and gradient background with featured/AI badges
- **Title & Stars**: GitHub stars if available
- **Category Badges**: Difficulty, industry, category tags
- **Description**: Recruiter summary (max 3 lines)
- **Expandable Features**: Click to view key features list
- **Scores**: Complexity and recruiter value progress bars
- **Tech Stack**: Language + top 3 technologies as colored badges
- **Action Buttons**: GitHub link + Demo link (if available)

**Animations**
```typescript
<motion.div
  initial={{ opacity: 0, y: 26 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
  transition={{
    delay: Math.min(index * 0.05, 0.3),
    duration: 0.45,
    ease: "easeOut"
  }}
  whileHover={{ y: -4 }}
>
```
- Staggered entrance (0.05s delay per card, max 0.3s)
- Lift on hover (y: -4)
- Smooth fade-in over 450ms

**Filtering Example**
Query: "AI projects"
1. Tokenizes to [ai, projects]
2. For each project, calls `searchProjects(query, portfolio, 6)`
3. `searchProjects()` calls `retrieveDocuments()` with local retrieval
4. Ranks by TF-IDF + category boost
5. Returns top 6 matching projects
6. Re-renders card grid with filtered results

### Hero section implementation

**Hero Component Flow**
1. Gets `profile` and `contact` from context
2. Renders:
   - Name (large animated text)
   - Roles (typed animation via react-type-animation)
   - Tagline and bio
   - Social links (GitHub, LinkedIn, etc.)
   - Call-to-action button → scrolls to contact section
3. Background: Animated gradient or particle effect

**Intersection Observer Pattern**
```typescript
const { ref, inView } = useInView({
  triggerOnce: true,  // Animate only on first view
  threshold: 0.08     // Trigger when 8% visible
});

<motion.div
  ref={ref}
  initial={{ opacity: 0, y: 20 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
>
```
- Used across all section components
- Enables staggered entrance animations as user scrolls
- Improves perceived performance

### Skills section implementation

**Skill Categories**
- AI & Machine Learning: TensorFlow, PyTorch, NLP, etc.
- Full Stack Development: React, Node.js, Tailwind, etc.
- Developer Tools: Git, Docker, Linux, etc.

**Rendering**
```typescript
portfolio.skills
  .filter(s => s.category === category)
  .map(skill => (
    <SkillCard
      name={skill.name}
      level={skill.level}
      icon={skill.icon}
      color={skill.color}
    />
  ))
```

**Skill Card Visual**
- Icon + skill name
- Horizontal proficiency bar (0-100%)
- Color coded by category
- Hover scale animation

### Timeline section (education + experience)

**Data Source**
```typescript
const { education, experience } = usePortfolio();
const entries = [...education, ...experience]
  .filter(e => e.type === "education" || e.type === "experience")
  .sort((a, b) => parseYear(b.year) - parseYear(a.year));
```

**Timeline Layout**
- Vertical line in center
- Left entries (education): positioned on left side
- Right entries (experience): positioned on right side
- Alternates based on `entry.side` field
- Connected to center line with animated connector lines

**Timeline Entry Content**
- Year badge
- Organization name
- Title (bold)
- Description (full text)
- Type indicator (education/experience/leadership)

### Achievements section

**Achievements Types**
- Awards: competitions, prizes, recognition
- Leadership: positions held, organized events
- Certifications: completed courses, credentials
- Academic: honors, GPA, distinctions

**Rendering**
```typescript
portfolio.certifications
  .filter(c => c.type === category)
  .map(cert => (
    <AchievementCard
      title={cert.title}
      description={cert.description}
      icon={cert.icon}
      link={cert.link}
    />
  ))
```

**Card Features**
- Large icon at top
- Title and type badge
- Description
- Optional link to credential/certificate

### Three.js animations

**ParticleField Component**
```typescript
const { ref, inView } = useInView();
const canvas = useRef<HTMLCanvasElement>(null);

useEffect(() => {
  if (!inView) return; // Don't render if not visible
  
  // Initialize Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(...);
  const renderer = new THREE.WebGLRenderer({ canvas });
  
  // Create particles
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  
  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    particles.rotation.x += 0.0001;
    particles.rotation.y += 0.0002;
    renderer.render(scene, camera);
  };
  animate();
}, [inView]);
```

**Performance**
- Only renders when visible (via useInView)
- Uses requestAnimationFrame for 60fps
- Particles fade with distance for depth effect
- Respond to scroll position

### Custom cursor component

**CustomCursor Flow**
```typescript
useEffect(() => {
  document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    setCursorPos({ x, y });
    
    // Check if hovering interactive element
    const target = document.elementFromPoint(x, y);
    setIsHovering(target?.matches("button, a, input"));
  });
}, []);

return (
  <motion.div
    animate={{ x: cursorPos.x - 8, y: cursorPos.y - 8 }}
    transition={{ type: "tween", duration: 0 }}
    className={isHovering ? "cursor-size-large" : "cursor-size-small"}
  />
);
```

**Visual Effects**
- Smooth cursor follows mouse (0ms lag)
- Grows on interactive elements
- Color changes on hover
- Blurs slightly for soft appearance

### Component composition pattern

Most section components follow this pattern:
```typescript
export default function SectionName() {
  const { dataSection } = usePortfolio();
  const { ref, inView } = useInView({ triggerOnce: true });
  
  return (
    <section ref={ref}>
      <SectionHeading title="Section Title" />
      
      <div className="grid gap-4">
        {dataSection.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.05 }}
          >
            <ItemCard {...item} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

**Key patterns**
- Get data from context via `usePortfolio()`
- Use `useInView` for scroll-triggered animations
- Staggered animation delays
- Responsive grid layout via Tailwind
- Error boundaries wrap critical sections

## 9. Data Persistence Architecture

### Portfolio data flow layers

The portfolio system uses a **three-tier persistence strategy**:

**Tier 1: Source of Truth (Upstash Redis or Memory)**
```
Production: Upstash Redis
  ↓
Development: In-memory map
  ↓
Fallback: JSON seed files
```

**Tier 2: Request Handling**
```typescript
// In lib/portfolio/repository.ts

export async function getPortfolio(): Promise<PortfolioData> {
  // 1. Check if Upstash configured
  if (upstashConfigured()) {
    const response = await upstashCommand(["GET", "portfolio:content:v1"]);
    if (typeof response?.result === "string") {
      const parsed = portfolioSchema.safeParse(JSON.parse(response.result));
      if (parsed.success) return parsed.data; // Redis hit
    }
  }
  
  // 2. Fallback to memory or seed
  return memoryPortfolio ?? seedPortfolio;
}
```

**Tier 3: Seeding Process**
```typescript
// In lib/portfolio/seed.ts

import projectsData from "@/data/projects.json";

export const seedPortfolio = {
  profile: require("@/data/portfolio/profile.json"),
  contact: require("@/data/portfolio/contact.json"),
  projects: projectsData as Project[], // From sync-github.ts output
  skills: require("@/data/portfolio/skills.json"),
  education: require("@/data/portfolio/education.json"),
  experience: require("@/data/portfolio/experience.json"),
  certifications: require("@/data/portfolio/certifications.json"),
} as PortfolioData;
```

### Upstash Redis integration

**Redis Key Structure**
```
Key: portfolio:content:v1
Type: STRING
Value: JSON serialized PortfolioData object
```

**Redis Commands Used**
```
GET portfolio:content:v1
  → Returns: { result: '{"profile": {...}, "projects": [...]}' }

SET portfolio:content:v1 $JSON_DATA
  → Returns: { result: "OK" }
```

**REST API Communication**
```typescript
async function upstashCommand(command: unknown[]) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store", // Never cache Redis reads/writes
  });
  
  return (await response.json()) as { result?: unknown };
}
```

**Admin Save Flow**
```
User clicks Save in /admin
       ↓
PUT /api/admin/content with updated section
       ↓
Server validates JSON against Zod schema
       ↓
Server calls updatePortfolioSection(section, value)
       ↓
Server calls getPortfolio() → fetch current from Redis
       ↓
Server merges: { ...currentPortfolio, [section]: validatedValue }
       ↓
Server calls savePortfolio() → SET portfolio:content:v1 $JSON
       ↓
Server calls revalidatePath("/") → Next.js invalidates cache
       ↓
Client receives updated portfolio
       ↓
Frontend re-renders
```

### Content validation system

**Zod Schema Hierarchy**
```typescript
// Individual section schemas
profileSchema: defines name, initials, tagline, roles, bio, location, stats
contactSchema: defines email, phone, linkedin, github, instagram, telegram
projectSchema: defines all project fields + intelligence layer
skillSchema: defines name, icon, level, category, color
timelineEntrySchema: defines education/experience entries
achievementSchema: defines certifications and awards

// Portfolio root schema
portfolioSchema: object with profile, contact, projects, skills, education, experience, certifications

// Section schemas map
sectionSchemas: Record<ContentSection, ZodType> → used by admin for targeted validation
```

**Validation on Admin Save**
```typescript
const updateSchema = z.object({
  section: contentSectionSchema,
  value: z.unknown()
});

const parsed = updateSchema.safeParse(await request.json());

if (!parsed.success) {
  return Response.json(
    { error: "Invalid content update.", issues: parsed.error.issues },
    { status: 400 }
  );
}

// Now validate the specific section
const validated = sectionSchemas[parsed.data.section].parse(parsed.data.value);
```

**Validation Examples**
```typescript
// Project validation
{
  id: "string", // required
  name: "string (max 120)", // required
  description: "string (max 2000)", // optional, defaults to ""
  stars: "number >= 0", // optional, defaults to 0
  githubUrl: "valid URL or empty string", // optional
  category: "string (max 100)", // optional
  resumeWorthiness: "number >= 0", // optional
  // ... all fields must match schema
}

// If validation fails:
{
  "error": "Invalid input",
  "issues": [
    {
      "code": "too_big",
      "maximum": 2000,
      "type": "string",
      "path": ["projects", 0, "description"]
    }
  ]
}
```

### Development vs Production data flows

**Development Mode**
```
getPortfolio()
  → Upstash not configured
  → Check memoryPortfolio
  → If null, return seedPortfolio
  
updatePortfolioSection(section, value)
  → Validate with Zod
  → Call savePortfolio()
  → Set memoryPortfolio = updated
  → Data persists for current server process
  → Data lost on restart
```

**Production Mode**
```
getPortfolio()
  → Upstash configured
  → Fetch from Redis
  → Parse and validate with schema
  → Return live data
  
updatePortfolioSection(section, value)
  → Validate with Zod
  → Call savePortfolio()
  → Persist to Redis
  → Data survives server restart
  → Shared across multiple instances
```

### Cache invalidation pattern

After admin updates or resume uploads:
```typescript
revalidatePath("/");
```

This tells Next.js to:
1. Invalidate home page static cache
2. Next request fetches `/api/portfolio` fresh
3. PortfolioProvider detects new data via context
4. All components re-render with updated portfolio

## 10. Environment Variables

The repo depends on these environment variables:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `BLOB_READ_WRITE_TOKEN`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `GROQ_API_KEY`
- `GROQ_MODEL`
- `NEXT_PUBLIC_CALENDLY_URL`
- `NEXT_PUBLIC_SITE_URL`
- `GITHUB_USERNAME`
- `GITHUB_TOKEN`

## 10. Environment Variables

The repo depends on these environment variables:

**Admin Authentication**
- `ADMIN_EMAIL`: Email for admin login
- `ADMIN_PASSWORD`: Password for admin login (min 8 chars recommended)
- `AUTH_SECRET`: Signing secret for session cookies (must be ≥ 32 chars)

**Persistence (Production)**
- `UPSTASH_REDIS_REST_URL`: Redis REST API endpoint
- `UPSTASH_REDIS_REST_TOKEN`: Bearer token for Redis REST API

**File Storage**
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob write token for resume uploads

**AI & LLM Configuration**
- `GEMINI_API_KEY`: Google AI API key
- `GEMINI_MODEL`: Model name (default: "gemini-2.5-flash")
- `OPENAI_API_KEY`: OpenAI API key (fallback)
- `OPENAI_MODEL`: Model name (default: "gpt-4o-mini")
- `GROQ_API_KEY`: Groq API key (emergency fallback)
- `GROQ_MODEL`: Model name (default: "llama-3.3-70b-versatile")

**GitHub Sync**
- `GITHUB_USERNAME`: GitHub username (default: 'Mandeep-vivu')
- `GITHUB_TOKEN`: Optional GitHub PAT for higher rate limits and private repos

**Public Configuration**
- `NEXT_PUBLIC_CALENDLY_URL`: Calendly scheduling link
- `NEXT_PUBLIC_SITE_URL`: Public site URL for sharing

## 11. Deployment and Runtime Notes

### Requirements
- Node.js 18+ runtime required
- Cannot use static export (need server routes for chat, admin, uploads)
- Requires server-side runtime: Vercel (with Node.js), AWS Lambda, Docker container, etc.

### Deployment checklist
```
1. Set all required environment variables
2. Run npm install
3. Run npm run build
4. Deploy to Node.js runtime
5. Configure Redis in production
6. Configure Vercel Blob for resume uploads
7. Test /admin login
8. Test chat functionality
9. Monitor logs for errors
```

### Scaling considerations

**Single Instance (Development)**
- In-memory portfolio storage
- Local session management
- Sufficient for small teams

**Multiple Instances (Production)**
- Use Upstash Redis for shared portfolio state
- Upstash automatically handles multi-instance consistency
- Rate limiting is per-instance (acceptable with low traffic)
- To implement global rate limits, add Upstash rate limit provider

**High Traffic (Future)**
- Add caching layer (Cloudflare KV, Vercel Edge Cache)
- Consider CDN for static assets
- Optimize image serving (next/image component)
- Monitor Gemini/OpenAI API quota

## 12. Request/Response Examples

### Chat API Request/Response

**Client Request**
```json
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {
      "role": "user",
      "content": "What AI projects has Mandeep built?"
    }
  ],
  "memory": null
}
```

**Server Response (Streaming)**
```
event: thinking
data: {}

event: blocks
data: {
  "type": "project_card",
  "projects": [
    {
      "id": "portfolio",
      "title": "Portfolio Website",
      "description": "AI-powered portfolio with chat assistant",
      "tech": ["Next.js", "React", "TypeScript"],
      "githubUrl": "https://github.com/Mandeep-vivu/portfolio",
      "demoUrl": "https://mandeep.dev",
      "category": "Full Stack",
      "difficulty": "Advanced",
      "resumeWorthiness": 85
    }
  ]
}

event: memory
data: {
  "activeTopic": "Projects",
  "lastProjects": ["portfolio"],
  "lastSkills": [],
  "lastEntities": [],
  "recentMessages": [
    {
      "role": "user",
      "content": "What AI projects has Mandeep built?"
    }
  ]
}

event: suggestions
data: ["Tell me more details", "What's the tech stack?", "Show me other projects"]

event: done
data: {}
```

### Admin Content Update

**Request**
```json
PUT /api/admin/content
Content-Type: application/json
Cookie: mandeep_admin_session=...

{
  "section": "profile",
  "value": {
    "name": "Mandeep Singh",
    "initials": "MS",
    "tagline": "AI/ML Engineer & Full Stack Developer",
    "roles": ["AI Engineer", "Full Stack Developer"],
    "bio": "Building intelligent systems...",
    "location": "India",
    "availableForWork": true,
    "resumeUrl": "https://blob.url/resume.pdf",
    "stats": [...]
  }
}
```

**Response**
```json
{
  "portfolio": {
    "profile": {...updated profile...},
    "contact": {...},
    "projects": [...],
    "skills": [...],
    "education": [...],
    "experience": [...],
    "certifications": [...]
  }
}
```

### GitHub Sync Output

**data/projects.json**
```json
[
  {
    "id": "portfolio",
    "name": "portfolio",
    "description": "Personal AI-powered portfolio website",
    "language": "TypeScript",
    "topics": ["next.js", "react", "ai", "portfolio"],
    "stars": 5,
    "forks": 2,
    "githubUrl": "https://github.com/Mandeep-vivu/portfolio",
    "demoUrl": "https://mandeep.dev",
    "updatedAt": "2026-06-15T10:30:00Z",
    "readmeSummary": "Full-stack portfolio with AI chat, admin editing, and GitHub sync...",
    "title": "Portfolio Website",
    "featured": true,
    "gradient": "from-violet-600/20 to-cyan-600/20",
    "icon": "ML",
    "category": "Full Stack",
    "difficulty": "Advanced",
    "skillsDemonstrated": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    "keyFeatures": ["AI Chat Assistant", "Admin Content Editor", "GitHub Sync"],
    "recruiterSummary": "Advanced full-stack portfolio project demonstrating...",
    "problemSolved": "Showcase portfolio with intelligent search and content management",
    "industryUseCase": "General Purpose",
    "projectType": "Production Application",
    "aiRelated": true,
    "technologies": ["Next.js", "React", "TypeScript", "Gemini", "Upstash"],
    "learningOutcomes": ["Full-stack development", "AI integration", "System design"],
    "resumeWorthiness": 85,
    "complexityScore": 78
  }
]
```

## 13. Notable Implementation Patterns

### Pattern 1: Graceful Degradation (AI Fallbacks)
- Try Gemini (primary) → on quota error → try Groq → on failure → use local retrieval
- Chat works without any LLM configured (extracts from portfolio data)
- Admin works without Vercel Blob (can edit, just not upload)
- Portfolio displays with seed data if Redis unavailable

### Pattern 2: Hybrid Retrieval (Dual Search)
- Local search: deterministic, always works, keyword-focused
- Vector search: semantic, requires embeddings, powerful for intent
- Both weighted and merged for robust retrieval

### Pattern 3: Lazy Loading & Streaming**
- Chat responses stream via ReadableStream (non-blocking UI)
- Components load on-demand (Three.js only when visible)
- Images lazy-loaded (next/image)
- Code-splitting: AIChat loads only on client

### Pattern 4: Typed Validation at Every Boundary
- Frontend → Backend: `chatRequestSchema`
- Backend → AI: `singleTurnResponseSchema`
- Admin → Backend: `sectionSchemas[section]`
- Backend → Storage: `portfolioSchema`
- All use Zod for runtime validation + TypeScript types

### Pattern 5: Signed Session Tokens
- No server-side session store needed
- Session data embedded in signed cookie
- Verification: decode payload → verify signature → check expiry
- Prevents tampering and forged sessions

### Pattern 6: Offline Data Sync
- GitHub sync is build/deployment step, not runtime
- Projects cached in JSON files
- AI intelligence generated during sync, cached indefinitely
- Runtime never queries GitHub directly (predictable performance)

### Pattern 7: Multi-Layer Caching
```
Browser sessionStorage (chat session)
    ↓
Next.js request cache (portfolio API)
    ↓
Upstash Redis (persistent storage)
    ↓
Server memory (fallback)
    ↓
Seed JSON files (last resort)
```

### Pattern 8: Intersection Observer Animations
- Only animate components when visible (scroll into view)
- Saves CPU/GPU cycles, smoother scrolling
- Triggers entrance animations
- Configured with `triggerOnce: true` to avoid re-triggering

### Pattern 9: Error Boundaries
- ChatErrorBoundary wraps AI chat component
- Prevents single component crash from breaking page
- Shows fallback UI on error

### Pattern 10: Request Identity for Rate Limiting
```typescript
requestIdentity(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}
```
- Uses proxy headers when behind load balancer
- Falls back to anonymous for local requests
- Enables per-user rate limiting

## 14. Important Files and Their Roles

**Core Configuration**
- `package.json` - Dependencies and npm scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js build config
- `tailwind.config.ts` - Tailwind CSS setup
- `vitest.config.ts` - Test runner config

**Entry Points**
- `app/page.tsx` - Home/portfolio page
- `app/layout.tsx` - Root layout
- `app/admin/page.tsx` - Admin dashboard

**API Routes**
- `app/api/portfolio/route.ts` - Portfolio fetch endpoint
- `app/api/chat/route.ts` - AI chat endpoint (core intelligence)
- `app/api/admin/content/route.ts` - Admin content CRUD
- `app/api/admin/session/route.ts` - Admin auth
- `app/api/admin/reindex/route.ts` - Retrieval reindex
- `app/api/admin/resume/route.ts` - Resume upload

**AI & Retrieval**
- `lib/ai/gemini.ts` - Model provider selection
- `lib/ai/retrieval.ts` - Local document search (Levenshtein, TF-IDF)
- `lib/ai/rag.ts` - Vector search (embeddings)
- `lib/ai/hybrid.ts` - Combines local + vector retrieval
- `lib/ai/schemas.ts` - Chat request/response schemas
- `lib/ai/memory.ts` - Conversation memory management
- `lib/ai/tools.ts` - Tool definitions for structured responses
- `lib/ai/suggestions.ts` - Generate next-turn suggestions

**Portfolio Management**
- `lib/portfolio/repository.ts` - Data access layer (Redis/memory)
- `lib/portfolio/seed.ts` - Initial portfolio data
- `lib/portfolio/types.ts` - TypeScript portfolio types
- `lib/portfolio/schemas.ts` - Zod schemas for validation

**Admin & Security**
- `lib/admin/auth.ts` - Session management and validation
- `lib/security/rate-limit.ts` - Rate limiting implementation

**Scripts**
- `scripts/sync-github.ts` - GitHub repo sync with AI intelligence
- `scripts/generate-embeddings.ts` - Vector embedding generation

**Components**
- `components/providers/PortfolioProvider.tsx` - Global data context
- `components/sections/Projects.tsx` - Featured projects display
- `components/ai/AIChat.tsx` - Chat UI and streaming handler
- `components/three/ParticleField.tsx` - Animated background
- `components/layout/CustomCursor.tsx` - Interactive cursor

**Data**
- `data/portfolio/*.json` - Seed portfolio content
- `data/projects.json` - Synced GitHub projects

## 15. Summary

This repository demonstrates a **production-ready full-stack application** with several sophisticated technical implementations:

1. **AI Integration**: Multi-provider LLM support with graceful fallbacks
2. **Hybrid Search**: Combines deterministic local search with semantic vector search
3. **Admin System**: Secure session management + real-time content editing
4. **Data Persistence**: Multi-tier caching from browser → Redis → local seed
5. **GitHub Integration**: Offline sync with AI-powered project intelligence
6. **Streaming Chat**: Real-time response streaming with fine-grained events
7. **Animations**: Performant scroll-triggered animations with Framer Motion
8. **Type Safety**: End-to-end TypeScript with Zod validation
9. **Scalability**: Single-instance development → multi-instance Redis production
10. **Error Handling**: Graceful degradation at every layer

The architecture emphasizes **maintainability** through clear separation of concerns, strong typing, and defensive programming patterns.
