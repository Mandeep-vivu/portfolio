import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import {
  contentSectionSchema,
} from "@/lib/portfolio/schemas";
import {
  getContentStorageMode,
  getPortfolio,
  updatePortfolioSection,
} from "@/lib/portfolio/repository";

const updateSchema = z.object({
  section: contentSectionSchema,
  value: z.unknown(),
});

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  return Response.json({
    portfolio: await getPortfolio(),
    storage: getContentStorageMode(),
  });
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid content update.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const portfolio = await updatePortfolioSection(
      parsed.data.section,
      parsed.data.value,
    );
    revalidatePath("/");
    return Response.json({ portfolio });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to save content.",
      },
      { status: 400 },
    );
  }
}
