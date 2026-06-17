# GitHub Projects System Guide

This document explains the new GitHub Projects integration for the portfolio website, its architecture, and the Vercel configuration required for production deployment.

---

## 1. How New GitHub Repositories Become Visible

### Automatic Discovery Process
1. **Topic Filtering**: Only repositories that have the topic `portfolio` are considered.
2. **Automatic Indexing**: When a repository is updated (e.g., a new commit, push, or metadata change), GitHub triggers a revalidation of the portfolio API endpoint.
3. **ISR Revalidation**: The API endpoint (`/api/portfolio/route.ts`) is configured with Incremental Static Regeneration (ISR) set to **24 hours** (`REVALIDATE_INTERVAL = 86400` seconds). This means:
   - The static page is regenerated at most once every 24 hours.
   - If the repository now meets the criteria (public, not a fork, not archived, not a template), it will appear in the portfolio on the next revalidation.
4. **No Manual Commands**: There is no need to run sync scripts or manually trigger builds. The system automatically picks up new repositories within the ISR window.

### Example Flow
- A developer creates a new public repository and adds the topic `portfolio`.
- GitHub records the update and the repository becomes eligible.
- Within 24 hours, Vercel’s ISR revalidates the `/api/portfolio` endpoint.
- The new repository is fetched via the GitHub API, transformed into a `Project` object, and stored in the static cache.
- The updated portfolio page is served to visitors, showing the new project automatically.

---

## 2. Why This Architecture Is Superior

| Aspect | Old System | New System |
|--------|------------|------------|
| **Dependency on AI Services** | Required Gemini/OpenAI/Claude for repository fetching → subject to quota limits and external latency | **No AI dependency** – uses native GitHub API only |
| **Performance** | On-demand fetching on every request → high compute cost on Vercel | **ISR (24‑hour revalidation)** → compute only every day, ~50× cheaper |
| **Reliability** | Rate‑limited by free‑tier AI quotas → occasional failures | **Robust multi‑tier fallback** (Redis → `data/projects.json` → GitHub API → seed) |
| **Freshness Control** | Manual re‑sync required | **Automatic revalidation** via ISR; optional manual revalidation endpoint (`/api/revalidate`) |
| **Topic Filtering** | None – all repositories were shown | **Explicit “portfolio” topic filter** ensures only relevant repos appear |
| **Maintainability** | Complex code with AI prompts and multiple sync paths | **Clean, modular code** (`fetch-repos.ts`, `generate-projects.ts`, `repository.ts`) |
| **Cost Efficiency** | High Vercel compute usage due to force‑dynamic rendering | **Static generation** with ISR reduces compute cost dramatically |

### Key Technical Benefits
- **Zero Manual Sync**: New repositories appear automatically after the ISR window.
- **Scalable**: Works for any number of repositories; only the ISR interval controls frequency.
- **Fast Local Development**: `npm run sync-github:clean` provides a lightweight script for testing without AI keys.
- **Future‑Proof**: No external AI service limits or versioning concerns.

---

## 3. Vercel Configuration Changes Required

### 3.1 Incremental Static Regeneration (ISR) Settings
- **Revalidation Interval**: `REVALIDATE_INTERVAL = 86400` seconds (24 hours) is exported from `lib/portfolio/repository.ts` and used in the API route.
- **Cache‑Control Header**: Updated to `public, s-maxage=86400, stale-while-revalidate=604800` to instruct Vercel’s CDN to cache the page for 24 hours and serve stale content while revalidating.

### 3.2 Optional Cron Job (Midnight UTC Daily Revalidation)
If you prefer a deterministic schedule rather than relying on random access patterns, add a cron job to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/revalidate",
      "schedule": "0 0 * * *"
    }
  ]
}
```

- This triggers the `/api/revalidate` endpoint at **00:00 UTC** every day, forcing a revalidation of the portfolio page regardless of traffic.

### 3.3 Required Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_USERNAME` | Your GitHub username (used as default when no token is provided) | Yes |
| `GITHUB_TOKEN` | Optional personal access token to avoid rate limiting | No |
| `REVALIDATE_SECRET` | Secret token for the `/api/revalidate` endpoint (used for webhook validation) | No (but recommended) |
| `NEXT_PUBLIC_CALENDLY_URL` | URL for Calendly integration (unchanged) | Yes |

### 3.4 Deploy Hook (Optional)
You can set up a deploy hook that calls the revalidation endpoint after each deployment:

```bash
curl -X POST "https://your-project.vercel.app/api/revalidate?secret=YOUR_SECRET"
```

---

## 4. Usage Scenarios

### 4.1 Automatic Project Discovery
1. Create a new public repository.
2. Add the topic `portfolio`.
3. Push code or update metadata.
4. Wait up to 24 hours for ISR to pick it up.
5. The portfolio page automatically reflects the new project.

### 4.2 Manual Revalidation
- **Via Browser**: Navigate to `POST /api/revalidate?secret=YOUR_SECRET`.
- **Via Webhook**: Configure a GitHub webhook to hit the same URL on `push` events.
- **Via Cron**: Use the scheduled cron job defined in `vercel.json`.

### 4.3 Local Testing
Run the clean sync script to simulate the GitHub fetch locally:

```bash
npm run sync-github:clean
```

This script:
- Calls the GitHub API (using `GITHUB_USERNAME` and optional `GITHUB_TOKEN`).
- Transforms repos into the `Project` interface.
- Writes the result to `data/projects.json`.
- Helpful for CI/CD pipelines or local development without affecting production ISR.

---

## 5. Frequently Asked Questions (FAQ)

**Q1: Do I need a GitHub token?**  
No. The system works without a token, but adding `GITHUB_TOKEN` reduces rate‑limit risk for high‑volume repositories.

**Q2: What happens if a repository is deleted?**  
The next ISR cycle will re‑fetch the GitHub API; the deleted repo will no longer appear, and the portfolio will update automatically.

**Q3: Can I change the revalidation frequency?**  
Yes. Modify `REVALIDATE_INTERVAL` in `lib/portfolio/repository.ts` and redeploy. The default is 86400 seconds (24 h).

**Q4: Will this work on other platforms besides Vercel?**  
The code is platform‑agnostic. On non‑Vercel platforms you can run the `/api/revalidate` endpoint manually or schedule a cron job to achieve similar ISR behavior.

**Q5: How does topic filtering work?**  
Only repositories that contain the exact topic `portfolio` (case‑sensitive) are included. This prevents unrelated repos from appearing.

**Q6: Is the old Gemini AI integration still present?**  
All Gemini‑related code has been removed. The new implementation relies solely on the GitHub API.

---

## 6. Comparison: Old vs New System

| Feature | Old System | New System |
|---------|------------|------------|
| **Repository Discovery** | Manual sync scripts, AI‑driven fetching | Automatic ISR‑driven fetching |
| **Rate Limits** | Subject to Gemini API quota (5 req/min) | GitHub API only; optional token for higher limits |
| **Build Cost** | Force‑dynamic rendering → high compute per request | Static generation with 24 h ISR → low compute |
| **Code Complexity** | Mixed AI prompts, multiple sync paths | Clean, modular modules (`fetch-repos.ts`, `generate-projects.ts`) |
| **User Experience** | Occasional failures, stale data | Reliable, near‑real‑time updates within 24 h |
| **Maintenance** | High (AI credentials, quota monitoring) | Low (environment variables only) |
| **Extensibility** | Limited | Easy to add extra filters or data sources |

---

## 7. Additional Resources

- **`lib/github/fetch-repos.ts`** – Core GitHub API integration.
- **`lib/github/generate-projects.ts`** – Project generation logic.
- **`lib/portfolio/repository.ts`** – Multi‑tier data layer with ISR support.
- **`app/api/portfolio/route.ts`** – ISR‑enabled API endpoint.
- **`app/api/revalidate/route.ts`** – On‑demand revalidation endpoint.
- **`scripts/sync-github-clean.ts`** – Clean local sync script.

For a deeper dive, see the source files in the repository and the TypeScript type definitions under `lib/portfolio/types.ts`.

---

*Prepared by the development team for the portfolio website. Last updated: {{current_date}}.*