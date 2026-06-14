import fs from 'fs';
import path from 'path';
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

// Define the paths
const DATA_DIR = path.join(process.cwd(), 'data');
const PORTFOLIO_DATA_DIR = path.join(DATA_DIR, 'portfolio');
const PROJECTS_CACHE_FILE = path.join(DATA_DIR, 'projects.json');
const OLD_PROJECTS_FILE = path.join(PORTFOLIO_DATA_DIR, 'projects.json');

// Interface matching the new Project schema
interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  topics: string[];
  stars: number;
  forks: number;
  githubUrl: string;
  demoUrl: string;
  updatedAt: string;
  readmeSummary?: string;
  // Preserved custom metadata
  title?: string | undefined;
  longDesc?: string | undefined;
  tech?: string[] | undefined;
  featured?: boolean | undefined;
  gradient?: string | undefined;
  icon?: string | undefined;
  github?: string | undefined;
  demo?: string | undefined;

  // Intelligence Layer fields
  category?: string;
  difficulty?: string;
  skillsDemonstrated?: string[];
  keyFeatures?: string[];
  recruiterSummary?: string;
  problemSolved?: string;
  industryUseCase?: string;
  projectType?: string;
  aiRelated?: boolean;
  technologies?: string[];
  learningOutcomes?: string[];
  resumeWorthiness?: number;
  complexityScore?: number;
}

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'Mandeep-vivu';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Define Zod schema for structured output
const projectIntelligenceSchema = z.object({
  category: z.string().describe("Classify the project category (e.g. Machine Learning, NLP, Web Development, DevOps, Full Stack, Computer Vision, Generative AI, Mobile Development, Automation, Data Engineering, etc.)"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).describe("Determine project difficulty based on size, architecture, tech stack, and README complexity"),
  skillsDemonstrated: z.array(z.string()).describe("List of core skills/libraries demonstrated (e.g., Python, PyTorch, React, Next.js, FastAPI, Docker, OpenCV)"),
  keyFeatures: z.array(z.string()).describe("List of key technical features implemented"),
  recruiterSummary: z.string().describe("A professional, recruiter-focused summary (3-5 lines) highlighting business value, technical depth, and demonstrated skills. Focus on impact and details, not generic README content."),
  problemSolved: z.string().describe("Define what real-world problem this project solves in 1 sentence"),
  industryUseCase: z.string().describe("Identify the industry vertical (e.g., Healthcare, Finance, Education, Recruitment, Retail, Logistics, Manufacturing, General Purpose)"),
  projectType: z.string().describe("Identify the project scale/nature (e.g., Research Project, Production Application, Portfolio Project, Academic Project, Personal Project, Open Source Contribution, Hackathon Project)"),
  aiRelated: z.boolean().describe("Whether this project uses AI, ML, Deep Learning, NLP, CV, LLMs, or related libraries"),
  technologies: z.array(z.string()).describe("Detailed list of languages, frameworks, databases, and major tools used"),
  learningOutcomes: z.array(z.string()).describe("List of technical or architectural learning outcomes"),
  resumeWorthiness: z.number().min(1).max(100).describe("Recruiter impact score from 1-100"),
  complexityScore: z.number().min(1).max(100).describe("Architecture/engineering complexity score from 1-100"),
});

async function fetchGitHubRepos() {
  const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Sync-Script'
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

async function fetchReadme(repoName: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/main/README.md`;
  let response = await fetch(url);
  if (!response.ok) {
    // Try master branch
    const masterUrl = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${repoName}/master/README.md`;
    response = await fetch(masterUrl);
  }
  if (response.ok) {
    return await response.text();
  }
  return "";
}

/**
 * Robust rule-based fallback metadata generator if AI analysis fails
 */
function generateFallbackIntelligence(repo: any, readmeContent: string): z.infer<typeof projectIntelligenceSchema> {
  const readmeLower = readmeContent.toLowerCase();
  const descriptionLower = (repo.description || "").toLowerCase();
  const combinedText = `${repo.name.toLowerCase()} ${descriptionLower} ${readmeLower}`;

  // 1. AI Related detection
  const aiKeywords = ["tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "opencv", "mediapipe", "nlp", "machine learning", "deep learning", "transformers", "llm", "openai", "gemini", "langchain", "rag", "artificial intelligence"];
  const aiRelated = aiKeywords.some(kw => combinedText.includes(kw));

  // 2. Category Detection
  let category = "Web Development";
  if (aiRelated) {
    if (combinedText.includes("nlp") || combinedText.includes("text") || combinedText.includes("language")) category = "NLP";
    else if (combinedText.includes("opencv") || combinedText.includes("vision") || combinedText.includes("pose") || combinedText.includes("image")) category = "Computer Vision";
    else if (combinedText.includes("llm") || combinedText.includes("openai") || combinedText.includes("transformers") || combinedText.includes("gpt")) category = "Generative AI";
    else if (combinedText.includes("deep") || combinedText.includes("neural") || combinedText.includes("pytorch") || combinedText.includes("tensorflow")) category = "Deep Learning";
    else category = "Machine Learning";
  } else if (combinedText.includes("postgres") || combinedText.includes("sql") || combinedText.includes("mongodb") || combinedText.includes("database") || combinedText.includes("rdbms")) {
    category = "Data Engineering";
  } else if (combinedText.includes("flutter") || combinedText.includes("dart") || combinedText.includes("android") || combinedText.includes("ios") || combinedText.includes("mobile")) {
    category = "Mobile Development";
  } else if (combinedText.includes("react") || combinedText.includes("next.js") || combinedText.includes("tailwind") || combinedText.includes("css")) {
    if (combinedText.includes("api") || combinedText.includes("express") || combinedText.includes("node") || combinedText.includes("fastapi")) {
      category = "Full Stack";
    } else {
      category = "Frontend";
    }
  } else if (combinedText.includes("bash") || combinedText.includes("shell") || combinedText.includes("linux") || combinedText.includes("automation")) {
    category = "Automation";
  }

  // 3. Difficulty Classification
  let difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert" = "Intermediate";
  const size = repo.size || 0;
  const complexityFactor = (repo.topics?.length || 0) * 2 + (repo.stargazers_count || 0) + (readmeContent.length / 500);
  if (complexityFactor < 5) difficulty = "Beginner";
  else if (complexityFactor > 40) difficulty = "Expert";
  else if (complexityFactor > 20) difficulty = "Advanced";

  // 4. Skills extraction
  const possibleSkills = ["Python", "Java", "C++", "JavaScript", "TypeScript", "HTML", "CSS", "React", "Next.js", "Flutter", "Dart", "SQL", "PostgreSQL", "MongoDB", "Bash", "Shell", "Docker", "AWS", "TensorFlow", "PyTorch", "Scikit-learn", "OpenCV", "MediaPipe", "Streamlit", "Linux", "REST API", "Socket.IO"];
  const skillsDemonstrated = possibleSkills.filter(skill => combinedText.includes(skill.toLowerCase()));
  if (repo.language && !skillsDemonstrated.includes(repo.language)) {
    skillsDemonstrated.unshift(repo.language);
  }

  // 5. Complexity Score (1-100)
  let complexityScore = 40;
  if (difficulty === "Beginner") complexityScore = 25 + Math.min(15, size / 100);
  else if (difficulty === "Intermediate") complexityScore = 45 + Math.min(15, size / 100);
  else if (difficulty === "Advanced") complexityScore = 65 + Math.min(15, size / 100);
  else if (difficulty === "Expert") complexityScore = 85 + Math.min(10, size / 100);
  complexityScore = Math.round(Math.min(99, complexityScore));

  // 6. Resume Worthiness (1-100)
  let resumeWorthiness = 35;
  if (repo.stargazers_count > 10) resumeWorthiness += 20;
  if (repo.forks_count > 5) resumeWorthiness += 10;
  if (difficulty === "Advanced") resumeWorthiness += 20;
  if (difficulty === "Expert") resumeWorthiness += 35;
  if (repo.homepage) resumeWorthiness += 10;
  resumeWorthiness = Math.round(Math.min(98, resumeWorthiness));

  // 7. Industry Use Case
  let industryUseCase = "General Purpose";
  if (combinedText.includes("covid") || combinedText.includes("health") || combinedText.includes("doctor") || combinedText.includes("medical")) industryUseCase = "Healthcare";
  else if (combinedText.includes("finance") || combinedText.includes("stock") || combinedText.includes("trade") || combinedText.includes("bank")) industryUseCase = "Finance";
  else if (combinedText.includes("learn") || combinedText.includes("school") || combinedText.includes("university") || combinedText.includes("student") || combinedText.includes("coursera")) industryUseCase = "Education";
  else if (combinedText.includes("fest") || combinedText.includes("registration") || combinedText.includes("candidate") || combinedText.includes("recruitment") || combinedText.includes("resume")) industryUseCase = "Recruitment";

  // 8. Project Type
  let projectType = "Personal Project";
  if (combinedText.includes("academic") || combinedText.includes("college") || combinedText.includes("university")) projectType = "Academic Project";
  else if (combinedText.includes("hackathon") || combinedText.includes("fest")) projectType = "Hackathon Project";
  else if (combinedText.includes("research") || combinedText.includes("paper")) projectType = "Research Project";
  else if (repo.homepage) projectType = "Production Application";

  // 9. Key Features & Problem Solved
  const keyFeatures = repo.topics && repo.topics.length > 0 ? repo.topics : ["Code repository", "Open-source development"];
  const problemSolved = repo.description || "Provides open-source utility and code examples.";

  // 10. Recruiter Summary
  const recruiterSummary = `A ${difficulty.toLowerCase()}-level ${category.toLowerCase()} project built with ${repo.language || "core technologies"}. Demonstrates practical implementation of ${skillsDemonstrated.slice(0, 3).join(", ")}. It solves the problem of "${problemSolved}" and showcases software engineering depth.`;

  return {
    category,
    difficulty,
    skillsDemonstrated,
    keyFeatures,
    recruiterSummary,
    problemSolved,
    industryUseCase,
    projectType,
    aiRelated,
    technologies: skillsDemonstrated,
    learningOutcomes: ["Technical design patterns", "Code documentation", "Software version control"],
    resumeWorthiness,
    complexityScore
  };
}

async function analyzeProjectIntelligence(repo: any, readmeContent: string): Promise<z.infer<typeof projectIntelligenceSchema>> {
  if (!GEMINI_API_KEY || !readmeContent || readmeContent.length < 10) {
    console.log(`Using rule-based fallback analysis for ${repo.name}...`);
    return generateFallbackIntelligence(repo, readmeContent);
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });
    const model = google("gemini-2.5-flash");

    console.log(`Running AI Portfolio analysis for ${repo.name}...`);
    const result = await generateObject({
      model,
      schema: projectIntelligenceSchema,
      prompt: `Analyze the following GitHub repository metadata and README file:
Repository Name: ${repo.name}
Description: ${repo.description || "None"}
Languages/Topics: Primary: ${repo.language || "None"}, Topics: ${repo.topics?.join(", ") || "None"}

README:
${readmeContent.substring(0, 12000)}

Perform a structured evaluation and populate all fields.`
    });

    return result.object;
  } catch (error) {
    console.warn(`Gemini intelligence analysis failed for ${repo.name}. Falling back to rule-based generation.`, error);
    return generateFallbackIntelligence(repo, readmeContent);
  }
}

function loadCustomMetadata(): Record<string, Partial<Project>> {
  const metadataMap: Record<string, Partial<Project>> = {};
  
  // Try loading from the old portfolio projects file to preserve existing custom designs
  try {
    if (fs.existsSync(OLD_PROJECTS_FILE)) {
      const oldProjects = JSON.parse(fs.readFileSync(OLD_PROJECTS_FILE, 'utf-8'));
      oldProjects.forEach((p: any) => {
        let repoName = p.id;
        if (p.github) {
          const parts = p.github.split('/');
          if (parts.length > 0) {
            const possibleName = parts[parts.length - 1];
            if (possibleName && possibleName !== 'Mandeep-vivu') {
              repoName = possibleName;
            }
          }
        }
        metadataMap[repoName.toLowerCase()] = p;
      });
    }
  } catch (error) {
    console.warn("Could not load old metadata:", error);
  }

  // Also load from current cache to preserve any cached metadata
  try {
    if (fs.existsSync(PROJECTS_CACHE_FILE)) {
      const currentProjects = JSON.parse(fs.readFileSync(PROJECTS_CACHE_FILE, 'utf-8'));
      currentProjects.forEach((p: Project) => {
        metadataMap[p.name.toLowerCase()] = {
          ...metadataMap[p.name.toLowerCase()],
          ...p
        };
      });
    }
  } catch (error) {
    console.warn("Could not load current cache metadata:", error);
  }

  return metadataMap;
}

async function sync() {
  console.log(`Starting GitHub sync for user: ${GITHUB_USERNAME}...`);
  try {
    const repos = await fetchGitHubRepos();
    console.log(`Fetched ${repos.length} repositories.`);

    const metadataMap = loadCustomMetadata();
    const projects: Project[] = [];

    for (const repo of repos) {
      const repoNameLower = repo.name.toLowerCase();
      const customMeta = metadataMap[repoNameLower] || {};

      const gradients = [
        "from-violet-600/20 to-cyan-600/20",
        "from-blue-600/20 to-indigo-600/20",
        "from-emerald-600/20 to-teal-600/20",
        "from-orange-600/20 to-red-600/20",
        "from-pink-600/20 to-rose-600/20",
        "from-yellow-600/20 to-amber-600/20"
      ];
      const defaultGradient = gradients[Math.floor(Math.random() * gradients.length)];

      let readmeContent = "";
      let readmeSummary = customMeta.readmeSummary || "";
      let intelligence: z.infer<typeof projectIntelligenceSchema> | null = null;

      // Force recalculation if files were updated on GitHub
      const isOutdated = customMeta.updatedAt !== repo.updated_at || !customMeta.recruiterSummary;

      if (isOutdated) {
        console.log(`Fetching README and generating intelligence for ${repo.name}...`);
        readmeContent = await fetchReadme(repo.name);
        intelligence = await analyzeProjectIntelligence(repo, readmeContent);
        readmeSummary = intelligence.recruiterSummary.substring(0, 180) + "...";
      } else {
        // Reuse already cached intelligence if unchanged
        console.log(`Reusing cached metadata for ${repo.name}...`);
        intelligence = {
          category: customMeta.category || "Web Development",
          difficulty: (customMeta.difficulty || "Intermediate") as any,
          skillsDemonstrated: customMeta.skillsDemonstrated || [],
          keyFeatures: customMeta.keyFeatures || [],
          recruiterSummary: customMeta.recruiterSummary || "",
          problemSolved: customMeta.problemSolved || "",
          industryUseCase: customMeta.industryUseCase || "General Purpose",
          projectType: customMeta.projectType || "Personal Project",
          aiRelated: customMeta.aiRelated || false,
          technologies: customMeta.technologies || [],
          learningOutcomes: customMeta.learningOutcomes || [],
          resumeWorthiness: customMeta.resumeWorthiness || 50,
          complexityScore: customMeta.complexityScore || 50,
        };
      }

      projects.push({
        id: repo.name,
        name: repo.name,
        description: repo.description || customMeta.description || '',
        language: repo.language || 'Unknown',
        topics: repo.topics || [],
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        githubUrl: repo.html_url,
        demoUrl: repo.homepage || customMeta.demoUrl || customMeta.demo || '',
        updatedAt: repo.updated_at,
        readmeSummary,
        
        // Custom metadata designs
        title: customMeta.title || repo.name,
        longDesc: customMeta.longDesc || customMeta.description || repo.description || '',
        tech: customMeta.tech || repo.topics || (repo.language ? [repo.language] : []),
        featured: customMeta.featured || (intelligence.resumeWorthiness >= 75),
        gradient: customMeta.gradient || defaultGradient,
        icon: customMeta.icon || (intelligence.aiRelated ? 'ML' : 'CODE'),

        // Intelligence Layer Cache
        category: intelligence.category,
        difficulty: intelligence.difficulty,
        skillsDemonstrated: intelligence.skillsDemonstrated,
        keyFeatures: intelligence.keyFeatures,
        recruiterSummary: intelligence.recruiterSummary,
        problemSolved: intelligence.problemSolved,
        industryUseCase: intelligence.industryUseCase,
        projectType: intelligence.projectType,
        aiRelated: intelligence.aiRelated,
        technologies: intelligence.technologies,
        learningOutcomes: intelligence.learningOutcomes,
        resumeWorthiness: intelligence.resumeWorthiness,
        complexityScore: intelligence.complexityScore,
      });
    }

    fs.writeFileSync(PROJECTS_CACHE_FILE, JSON.stringify(projects, null, 2));
    console.log(`Successfully synced and saved ${projects.length} projects to ${PROJECTS_CACHE_FILE}`);

    // Push directly to Upstash if configured
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.log("Upstash Redis is configured. Updating content store...");
      try {
        const url = process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.UPSTASH_REDIS_REST_TOKEN;
        
        // Fetch current portfolio from Redis first to preserve other sections
        const getResponse = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(["GET", "portfolio:content:v1"]),
        });
        
        let portfolioData: any = null;
        if (getResponse.ok) {
          const resJson = await getResponse.json();
          if (typeof resJson.result === "string") {
            portfolioData = JSON.parse(resJson.result);
          }
        }
        
        if (portfolioData) {
          portfolioData.projects = projects;
          const setResponse = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(["SET", "portfolio:content:v1", JSON.stringify(portfolioData)]),
          });
          if (setResponse.ok) {
            console.log("Successfully updated projects in Upstash Redis content store.");
          } else {
            console.warn("Failed to set updated portfolio in Upstash Redis.");
          }
        } else {
          console.warn("Could not retrieve existing portfolio from Upstash to update projects.");
        }
      } catch (redisErr) {
        console.error("Error updating Upstash Redis content store:", redisErr);
      }
    }

  } catch (error) {
    console.error('Error during GitHub sync:', error);
    process.exit(1);
  }
}

sync();
