import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: "server-only", replacement: `${root}test/server-only-stub.ts` },
      { find: "@", replacement: root },
    ],
  },
  test: {
    environment: "node",
  },
});
