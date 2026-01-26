import type { UserConfig as Options } from "tsdown";
import { defineConfig } from "tsdown";

export default defineConfig(
  (options: Options) =>
    ({
      ...options,
      entry: [
        "!src/test/**",
        "src/index.ts",
        "src/prisma/index.ts",
        "src/resolver/index.ts",
        "src/server/server.ts",
        "src/services/idempotency.ts",
        "src/services/items.ts",
        "src/services/ledger.ts",
        "src/services/logger.ts",
        "src/services/validation.ts"
      ],
      format: ["esm"],
      clean: true,
      dts: { tsgo: true },
      cwd: process.cwd(),
      target: "node25",
      fixedExtension: false,
      outDir: "dist",
      unbundle: true
    }) satisfies Options
);
