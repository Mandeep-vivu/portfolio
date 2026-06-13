import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import {
  getPortfolio,
  updatePortfolioSection,
} from "@/lib/portfolio/repository";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Vercel Blob storage is not configured." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("resume");

  if (!(file instanceof File) || file.type !== "application/pdf") {
    return Response.json({ error: "A PDF resume is required." }, { status: 400 });
  }
  if (file.size > MAX_RESUME_BYTES) {
    return Response.json(
      { error: "Resume must be 5 MB or smaller." },
      { status: 400 },
    );
  }

  const blob = await put(`resumes/mandeep-singh-${Date.now()}.pdf`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  const portfolio = await getPortfolio();
  const nextProfile = { ...portfolio.profile, resumeUrl: blob.url };
  await updatePortfolioSection("profile", nextProfile);
  revalidatePath("/");

  return Response.json({ url: blob.url });
}
