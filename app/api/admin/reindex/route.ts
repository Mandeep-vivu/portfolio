import { requireAdmin } from "@/lib/admin/auth";
import { getPortfolio } from "@/lib/portfolio/repository";
import { buildKnowledgeDocuments } from "@/lib/ai/retrieval";

export async function POST() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const documents = buildKnowledgeDocuments(await getPortfolio());
  return Response.json({
    indexed: documents.length,
    message:
      "The local retrieval index is generated from current content on each server instance.",
  });
}
