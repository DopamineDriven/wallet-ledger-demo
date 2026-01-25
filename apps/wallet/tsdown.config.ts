import type { UserConfig as Options } from "tsdown";
import { defineConfig } from "tsdown";

export default defineConfig(
  (options: Options) =>
    ({
      ...options,
      entry: [
        "!src/test/**",
        "src/index.ts",
        // "src/balance/index.ts",
        // "src/credits/index.ts",
        "src/data/seed.ts",
        "src/data/types.ts",
        "src/items/gen/items-data.ts",
        // "src/resolver/index.ts",
        // "src/purchases/index.ts",
        // "src/types/index.ts",
        // "dist/prisma/purchases.ts",
        // "src/prisma/credits.ts",
        // "src/prisma/idempotency.ts",
        // "src/prisma/index.ts",
        // "src/prisma/utils.ts"
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
