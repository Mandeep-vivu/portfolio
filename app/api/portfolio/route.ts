import { getContentStorageMode, getPortfolio } from "@/lib/portfolio/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const portfolio = await getPortfolio();
  return Response.json(portfolio, {
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Storage": getContentStorageMode(),
    },
  });
}
