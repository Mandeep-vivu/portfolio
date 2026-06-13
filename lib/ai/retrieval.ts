import "server-only";

import type { PortfolioData } from "@/lib/portfolio/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KnowledgeDocument = {
  id: string;
  category: string;
  title: string;
  content: string;
  /** Optional extra terms that boost discoverability without being shown. */
  searchableTerms?: string;
};

export type RetrievedDocument = KnowledgeDocument & { score: number };

// ---------------------------------------------------------------------------
// Stop words
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "about", "at", "be", "been", "by", "can",
  "could", "do", "does", "for", "from", "had", "has", "have", "he",
  "her", "him", "his", "how", "i", "if", "in", "is", "it", "its",
  "me", "my", "no", "not", "of", "on", "or", "our", "say", "she",
  "so", "some", "than", "that", "the", "them", "then", "there",
  "these", "they", "this", "those", "to", "us", "was", "we",
  "were", "what", "when", "where", "which", "who", "will", "with",
  "would", "you", "your", "mandeep", "mandeep's", "singh",
  "tell", "show", "give", "please", "know", "want", "need",
  "like", "also", "just", "really", "very",
]);

// ---------------------------------------------------------------------------
// Synonym map — expands query terms for broader matching
// ---------------------------------------------------------------------------

const SYNONYM_MAP: Record<string, string[]> = {
  // Programming & CS
  coding: ["programming", "development", "software"],
  programming: ["coding", "development", "software"],
  developer: ["engineer", "programmer", "coder"],
  engineer: ["developer", "programmer"],
  software: ["application", "app", "program", "code"],
  backend: ["server", "database", "api", "rest", "postgresql"],
  frontend: ["ui", "react", "next.js", "html", "css", "interface"],
  fullstack: ["full-stack", "frontend", "backend", "web"],
  "full-stack": ["fullstack", "frontend", "backend", "web"],
  web: ["website", "webapp", "frontend", "html", "css", "react"],
  mobile: ["mobiles", "phone", "number", "tel", "contact", "call", "whatsapp", "flutter", "app", "android", "ios", "dart"],
  mobiles: ["mobile", "phone", "number", "tel", "contact", "call", "whatsapp", "flutter", "app", "android", "ios", "dart"],
  app: ["apps", "application", "mobile", "software"],
  apps: ["app", "application", "mobile", "software"],
  api: ["rest", "endpoint", "backend", "server"],

  // AI/ML
  ai: ["artificial intelligence", "machine learning", "ml", "deep learning", "neural"],
  ml: ["machine learning", "ai", "artificial intelligence", "model"],
  "machine learning": ["ml", "ai", "deep learning", "neural network"],
  "artificial intelligence": ["ai", "ml", "machine learning"],
  "deep learning": ["neural network", "tensorflow", "pytorch", "ml"],
  "data science": ["data analysis", "analytics", "pandas", "numpy", "statistics"],
  "computer vision": ["opencv", "mediapipe", "image", "cv", "pose"],
  nlp: ["natural language", "text", "language processing"],

  // Tools & tech
  database: ["databases", "postgresql", "mongodb", "sql", "db", "rdbms"],
  databases: ["database", "postgresql", "mongodb", "sql", "db", "rdbms"],
  db: ["database", "postgresql", "mongodb", "sql"],
  cloud: ["docker", "kubernetes", "deployment", "devops"],
  devops: ["docker", "kubernetes", "cloud", "deployment", "linux", "bash"],

  // Career/edu
  education: ["study", "degree", "university", "college", "school", "academic"],
  degree: ["education", "btech", "me", "university", "qualification"],
  university: ["college", "education", "school", "campus"],
  college: ["university", "education", "school", "campus"],
  experience: ["work", "internship", "intern", "job", "career", "professional"],
  internship: ["internships", "intern", "experience", "work", "training"],
  internships: ["internship", "intern", "experience", "work", "training"],
  intern: ["interns", "internship", "experience", "trainee"],
  interns: ["intern", "internship", "experience", "trainee"],
  work: ["experience", "job", "career", "employment"],
  job: ["jobs", "work", "experience", "career", "employment"],
  jobs: ["job", "work", "experience", "career", "employment"],
  resume: ["cv", "curriculum vitae"],
  cv: ["resume", "curriculum vitae"],
  certification: ["certifications", "certificate", "certified", "credential"],
  certifications: ["certification", "certificate", "certified", "credential"],
  certificate: ["certificates", "certification", "certified", "credential"],
  certificates: ["certificate", "certification", "certified", "credential"],
  achievement: ["achievements", "award", "accomplishment", "honor", "recognition"],
  achievements: ["achievement", "award", "accomplishment", "honor", "recognition"],
  award: ["awards", "achievement", "prize", "honor", "recognition", "winner"],
  awards: ["award", "achievement", "prize", "honor", "recognition", "winner"],
  leadership: ["leader", "president", "vice president", "head", "organize"],
  skill: ["skills", "ability", "proficiency", "expertise", "capability", "competency"],
  skills: ["skill", "ability", "proficiency", "expertise", "capability", "competency"],
  ability: ["skill", "skills", "proficiency", "expertise"],
  project: ["projects", "built", "created", "developed", "work", "portfolio"],
  projects: ["project", "built", "created", "developed", "work", "portfolio"],
  built: ["project", "projects", "created", "developed", "made"],

  // Contact
  contact: ["reach", "email", "phone", "mobile", "number", "connect", "hire", "linkedin", "github"],
  email: ["emails", "contact", "mail", "reach"],
  emails: ["email", "contact", "mail", "reach"],
  phone: ["phones", "mobile", "number", "tel", "contact", "call", "whatsapp", "telephone"],
  phones: ["phone", "mobile", "number", "tel", "contact", "call", "whatsapp", "telephone"],
  number: ["numbers", "phone", "mobile", "tel", "contact", "call", "whatsapp", "telephone"],
  numbers: ["number", "phone", "mobile", "tel", "contact", "call", "whatsapp", "telephone"],
  hire: ["recruit", "employ", "contact", "available"],
  recruit: ["hire", "employ", "available"],
  schedule: ["book", "meeting", "interview", "call", "calendly"],
  interview: ["meeting", "call", "schedule", "book"],
  meeting: ["interview", "call", "schedule", "book"],

  // Misc
  good: ["strong", "proficient", "skilled", "expert", "best"],
  best: ["strongest", "top", "primary", "main", "good"],
  strong: ["good", "proficient", "skilled", "expert"],
  latest: ["recent", "current", "new"],
  about: ["bio", "profile", "summary", "overview", "background", "introduction"],
};

// ---------------------------------------------------------------------------
// Tokenization
// ---------------------------------------------------------------------------

export function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/** Generate bigrams (two-word phrases) from token array. */
function bigrams(tokens: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    result.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return result;
}

/** Expand query tokens with synonyms. Returns deduplicated expanded list. */
function expandWithSynonyms(tokens: string[]): string[] {
  const expanded = new Set(tokens);

  for (const token of tokens) {
    const synonyms = SYNONYM_MAP[token];
    if (synonyms) {
      for (const syn of synonyms) {
        // Add multi-word synonyms as individual tokens too
        for (const part of syn.split(/\s+/)) {
          if (part.length > 1 && !STOP_WORDS.has(part)) {
            expanded.add(part);
          }
        }
      }
    }
  }

  // Also check bigrams against synonym map
  const queryBigrams = bigrams(tokens);
  for (const bg of queryBigrams) {
    const synonyms = SYNONYM_MAP[bg];
    if (synonyms) {
      for (const syn of synonyms) {
        for (const part of syn.split(/\s+/)) {
          if (part.length > 1 && !STOP_WORDS.has(part)) {
            expanded.add(part);
          }
        }
      }
    }
  }

  return [...expanded];
}

// ---------------------------------------------------------------------------
// Fuzzy matching — Levenshtein distance based
// ---------------------------------------------------------------------------

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // Optimize: if length difference is too large, skip expensive computation
  if (Math.abs(m - n) > 2) return Math.max(m, n);

  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);

  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1,        // deletion
        (curr[j - 1] ?? 0) + 1,    // insertion
        (prev[j - 1] ?? 0) + cost, // substitution
      );
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j] ?? 0;
  }
  return prev[n] ?? n;
}

/** Check if a query token fuzzy-matches any document token. */
function fuzzyMatch(queryToken: string, docTokens: string[]): number {
  if (queryToken.length < 4) return 0; // Only fuzzy match longer tokens

  let best = 0;
  for (const dt of docTokens) {
    if (dt.length < 4) continue;
    const dist = levenshtein(queryToken, dt);
    const maxLen = Math.max(queryToken.length, dt.length);
    // Allow 1 edit for 4-6 char tokens, 2 edits for 7+ char tokens
    const threshold = maxLen <= 6 ? 1 : 2;
    if (dist <= threshold && dist > 0) {
      const similarity = 1 - dist / maxLen;
      if (similarity > best) best = similarity;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function termFrequency(tokens: string[]): Map<string, number> {
  const frequencies = new Map<string, number>();
  for (const token of tokens) {
    frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
  }
  return frequencies;
}

/** Compute IDF weights across a document corpus. */
function inverseDocumentFrequency(
  corpus: string[][],
): Map<string, number> {
  const docCount = corpus.length;
  const df = new Map<string, number>();

  for (const doc of corpus) {
    const unique = new Set(doc);
    for (const token of unique) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [token, count] of df) {
    idf.set(token, Math.log((docCount + 1) / (count + 1)) + 1);
  }
  return idf;
}

const CATEGORY_SIGNALS: Record<string, string[]> = {
  project: ["project", "projects", "built", "created", "developed", "made", "app", "apps", "application", "applications", "system", "systems"],
  skill: ["skill", "skills", "proficiency", "expertise", "good", "strong", "know", "proficient", "ability", "abilities", "tech", "technology", "technologies", "stack", "tools"],
  education: ["education", "study", "degree", "degrees", "university", "universities", "college", "colleges", "school", "schools", "academic", "qualification", "qualifications", "btech", "masters"],
  experience: ["experience", "experiences", "work", "works", "internship", "internships", "intern", "interns", "job", "jobs", "career", "professional", "company"],
  leadership: ["leadership", "leader", "president", "head", "organize", "managed", "led", "team"],
  certification: ["certification", "certifications", "certificate", "certificates", "certified", "credential", "credentials", "course", "courses", "coursera"],
  award: ["award", "awards", "achievement", "achievements", "prize", "honor", "recognition", "winner", "place", "1st", "2nd"],
  contact: ["contact", "contacts", "email", "emails", "phone", "phones", "mobile", "mobiles", "number", "numbers", "whatsapp", "tel", "telephone", "linkedin", "github", "reach", "connect"],
  profile: ["about", "bio", "profile", "summary", "overview", "who", "background", "introduction", "himself"],
};

function categoryBoost(queryTokens: string[], docCategory: string): number {
  let boost = 1.0;
  for (const [category, signals] of Object.entries(CATEGORY_SIGNALS)) {
    const matches = queryTokens.filter((t) => signals.includes(t)).length;
    if (matches > 0) {
      if (docCategory === category || docCategory.startsWith(category)) {
        boost += matches * 0.15;
      }
    }
  }
  return boost;
}

// ---------------------------------------------------------------------------
// Knowledge document builder — enriched with searchable terms
// ---------------------------------------------------------------------------

export function buildKnowledgeDocuments(
  portfolio: PortfolioData,
): KnowledgeDocument[] {
  const profile = portfolio.profile;

  return [
    {
      id: "profile",
      category: "profile",
      title: profile.name,
      content: [
        profile.tagline,
        profile.bio,
        `Location: ${profile.location}`,
        `Roles: ${profile.roles.join(", ")}`,
        `Available for work: ${profile.availableForWork ? "yes" : "no"}`,
        `Stats: ${profile.stats.map((s) => `${s.value}${s.suffix} ${s.label}`).join(", ")}`,
      ].join("\n"),
      searchableTerms: "about bio profile summary overview introduction background who himself herself person developer engineer",
    },
    {
      id: "contact",
      category: "contact",
      title: "Contact details",
      content: [
        `Email: ${portfolio.contact.email}`,
        `Phone: ${portfolio.contact.phone}`,
        `LinkedIn: ${portfolio.contact.linkedin}`,
        `GitHub: ${portfolio.contact.github}`,
        `Portfolio: ${portfolio.contact.portfolioUrl}`,
      ].join("\n"),
      searchableTerms: "contact reach connect email phone mobile number call whatsapp tel telephone linkedin github hire recruit social",
    },
    ...portfolio.projects.map((project) => ({
      id: project.id,
      category: "project",
      title: project.title,
      content: `${project.description}\n${project.longDesc}\nTechnology: ${project.tech.join(", ")}`,
      searchableTerms: `project built created developed application ${project.tech.map((t) => t.toLowerCase()).join(" ")}`,
    })),
    ...portfolio.skills.map((skill) => ({
      id: `skill-${skill.name.toLowerCase().replace(/\W+/g, "-")}`,
      category: "skill",
      title: skill.name,
      content: `${skill.name} is listed in the ${skill.category} category with a portfolio proficiency level of ${skill.level}%. Category: ${skill.category === "ai" ? "AI & Machine Learning" : skill.category === "fullstack" ? "Full Stack Development" : "Developer Tools"}.`,
      searchableTerms: `skill proficiency expertise ability technology tech stack tools ${skill.category}`,
    })),
    {
      id: "skills-summary",
      category: "skill",
      title: "Skills Overview",
      content: [
        "AI & Machine Learning skills: " + portfolio.skills.filter((s) => s.category === "ai").map((s) => `${s.name} (${s.level}%)`).join(", "),
        "Full Stack Development skills: " + portfolio.skills.filter((s) => s.category === "fullstack").map((s) => `${s.name} (${s.level}%)`).join(", "),
        "Developer Tools: " + portfolio.skills.filter((s) => s.category === "tools").map((s) => `${s.name} (${s.level}%)`).join(", "),
        `Strongest skills: ${portfolio.skills.sort((a, b) => b.level - a.level).slice(0, 5).map((s) => `${s.name} (${s.level}%)`).join(", ")}`,
      ].join("\n"),
      searchableTerms: "skills overview summary all technologies stack proficiency expertise what good strong best top",
    },
    ...portfolio.education.map((entry) => ({
      id: entry.id,
      category: "education",
      title: entry.title,
      content: `${entry.year} at ${entry.org}. ${entry.description}`,
      searchableTerms: "education study degree university college school academic qualification",
    })),
    ...portfolio.experience.map((entry) => ({
      id: entry.id,
      category: entry.type,
      title: entry.title,
      content: `${entry.year} at ${entry.org}. ${entry.description}`,
      searchableTerms: `${entry.type} work career professional ${entry.type === "leadership" ? "leader organize managed led team" : "intern job company employment"}`,
    })),
    ...portfolio.certifications.map((entry) => ({
      id: entry.id,
      category: entry.type,
      title: entry.title,
      content: entry.description,
      searchableTerms: `${entry.type} ${entry.type === "certification" ? "certificate certified credential course coursera" : entry.type === "leadership" ? "leader organize managed led team" : "award achievement prize honor recognition winner"}`,
    })),
  ];
}

// ---------------------------------------------------------------------------
// Main retrieval function — multi-signal scoring
// ---------------------------------------------------------------------------

export function retrieveDocuments(
  query: string,
  documents: KnowledgeDocument[],
  limit = 5,
): RetrievedDocument[] {
  const rawQueryTokens = tokenize(query);
  if (!rawQueryTokens.length) return [];

  // Expand query with synonyms
  const expandedTokens = expandWithSynonyms(rawQueryTokens);
  const queryBigrams = bigrams(rawQueryTokens);

  // Build document token corpus for IDF
  const corpus = documents.map((doc) => [
    ...tokenize(doc.title),
    ...tokenize(doc.content),
    ...tokenize(doc.searchableTerms ?? ""),
  ]);
  const idf = inverseDocumentFrequency(corpus);

  // Score each document
  return documents
    .map((document, index) => {
      const titleTokens = tokenize(document.title);
      const contentTokens = tokenize(document.content);
      const searchTokens = tokenize(document.searchableTerms ?? "");
      const allDocTokens = [...titleTokens, ...contentTokens, ...searchTokens];

      // Signal 1: TF-IDF weighted cosine similarity with expanded query
      const queryTf = termFrequency(expandedTokens);
      const docTf = termFrequency(allDocTokens);
      const vocabulary = new Set([...queryTf.keys(), ...docTf.keys()]);
      let dot = 0;
      let magA = 0;
      let magB = 0;

      for (const token of vocabulary) {
        const qVal = (queryTf.get(token) ?? 0) * (idf.get(token) ?? 1);
        const dVal = (docTf.get(token) ?? 0) * (idf.get(token) ?? 1);
        dot += qVal * dVal;
        magA += qVal * qVal;
        magB += dVal * dVal;
      }
      const tfidfScore = magA && magB ? dot / Math.sqrt(magA * magB) : 0;

      // Signal 2: Direct title matches (exact raw query tokens, higher weight)
      const titleExactMatches = rawQueryTokens.filter((t) =>
        titleTokens.includes(t),
      ).length;

      // Signal 3: Bigram matches in document
      const docBigrams = bigrams(corpus[index] ?? []);
      const bigramMatches = queryBigrams.filter((bg) =>
        docBigrams.includes(bg),
      ).length;

      // Signal 4: Fuzzy matching for typo tolerance
      let fuzzyScore = 0;
      for (const qt of rawQueryTokens) {
        const match = fuzzyMatch(qt, allDocTokens);
        if (match > 0) fuzzyScore += match;
      }

      // Signal 5: Category boost
      const catBoost = categoryBoost(rawQueryTokens, document.category);

      // Combine signals with weights
      const rawScore =
        tfidfScore * 0.40 +
        titleExactMatches * 0.22 +
        bigramMatches * 0.18 +
        fuzzyScore * 0.12;

      const score = rawScore * catBoost;
      return { ...document, score };
    })
    .filter((document) => document.score >= 0.06)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Project search helper
// ---------------------------------------------------------------------------

export function searchProjects(
  query: string,
  portfolio: PortfolioData,
  limit = 6,
) {
  const documents = portfolio.projects.map((project) => ({
    id: project.id,
    category: "project",
    title: project.title,
    content: `${project.description} ${project.longDesc} ${project.tech.join(" ")}`,
    searchableTerms: `project built created developed ${project.tech.map((t) => t.toLowerCase()).join(" ")}`,
  }));
  const ranked = retrieveDocuments(query, documents, limit);
  return ranked
    .map((match) =>
      portfolio.projects.find((project) => project.id === match.id),
    )
    .filter(
      (project): project is PortfolioData["projects"][number] =>
        Boolean(project),
    );
}
