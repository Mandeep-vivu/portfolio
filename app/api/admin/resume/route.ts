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

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("resume");

  if (!(file instanceof File) || file.type !== "application/pdf") {
    return Response.json({ error: "A PDF resume is required." }, { status: 400 });
  }
  if (file.size > MAX_RESUME_BYTES) {
    return Response.json(
      { error: "Resume must be 5 MB or smaller." },
      { status: 400 },
    );
  }

  // The browser-supplied MIME type is only a hint; check the PDF signature.
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (new TextDecoder().decode(header) !== "%PDF-") {
    return Response.json({ error: "The file is not a valid PDF." }, { status: 400 });
  }

  try {
    const blob = await put(`resumes/mandeep-singh-${Date.now()}.pdf`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/pdf",
    });
    const portfolio = await getPortfolio();
    await updatePortfolioSection("profile", { ...portfolio.profile, resumeUrl: blob.url });
    revalidatePath("/");

    return Response.json({ url: blob.url });
  } catch (error) {
    console.error("Resume upload failed:", error);
    return Response.json({ error: "Unable to upload the resume." }, { status: 502 });
  }
}
