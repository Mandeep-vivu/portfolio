import HomeClient from "@/components/home/HomeClient";
import { getDesign } from "@/lib/design-server";
import { getPortfolio } from "@/lib/portfolio/repository";

// Content is loaded on the server so the first HTML response already carries
// the current portfolio (including edits saved from /admin) in the design the
// visitor last chose.
export default async function Home() {
  const [portfolio, design] = await Promise.all([getPortfolio(), getDesign()]);
  return <HomeClient portfolio={portfolio} initialDesign={design} />;
}
