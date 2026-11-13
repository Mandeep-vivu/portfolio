import "server-only";

import { cookies } from "next/headers";
import { DESIGN_COOKIE, parseDesign, type Design } from "./design";

/** The visitor's chosen design. Reading cookies makes the route dynamic. */
export async function getDesign(): Promise<Design> {
  return parseDesign((await cookies()).get(DESIGN_COOKIE)?.value);
}
