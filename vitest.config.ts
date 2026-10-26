import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

function loadEnvFile(path: string): Record<string, string> {
  const env: Record<string, string> = {};

  try {
    const content = readFileSync(path, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;

      let value = match[2].trim();
      const quoted =
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"));

      if (quoted) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  } catch {
    // O arquivo .env.test é obrigatório para os testes de integração.
  }

  return env;
}

const testEnv = loadEnvFile(`${root}.env.test`);

export default defineConfig({
  resolve: {
    alias: { "@": `${root}src` },
  },
  test: {
    environment: "node",
    fileParallelism: false,
    env: testEnv,
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
});
