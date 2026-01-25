import "dotenv/config";
import type { PrismaConfig } from "prisma/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema",
  experimental: { extensions: true },
  datasource: { url: env("DATABASE_URL") },
  migrations: {
    path: "prisma/migrations"
  }
} satisfies PrismaConfig);
