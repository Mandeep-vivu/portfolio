import HomeClient from "@/components/home/HomeClient";
import { getPortfolio } from "@/lib/portfolio/repository";

// Content is loaded on the server so the first HTML response already carries
// the current portfolio (including edits saved from /admin, which call
// revalidatePath("/")).
export default async function Home() {
  return <HomeClient portfolio={await getPortfolio()} />;
}
