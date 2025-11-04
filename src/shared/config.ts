import { logger } from "@shared/logger";
import { z } from "zod";

const dbConfigSchema = z.object({
  USER: z.string(),
  PASSWORD: z.string(),
  HOST: z.string(),
  PORT: z.coerce.number(),
  NAME: z.string(),
});

const apiConfigSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("localhost"),
});

const redisConfigSchema = z.object({
  HOST: z.string().default("localhost"),
  PORT: z.coerce.number().default(6379),
  PASSWORD: z.string().optional(),
});

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  API: apiConfigSchema,
  DB: dbConfigSchema,
  REDIS: redisConfigSchema,
});

const prefixes = Object.entries(configSchema.shape)
  .filter(([k, value]) => typeof value === "object" && k !== "NODE_ENV")
  .map(([k]) => k);

function buildNestedEnv(env: NodeJS.ProcessEnv) {
  const nested: Record<string, any> = {};

  for (const prefix of prefixes) {
    nested[prefix] = {};
  }

  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;

    const prefix = prefixes.find((p) => key.startsWith(`${p}_`));
    if (prefix) {
      const rest = key.slice(prefix.length + 1);
      if (rest) {
        nested[prefix][rest] = value;
        continue;
      }
    }

    nested[key] = value;
  }

  return nested;
}

const parsed = configSchema.safeParse(buildNestedEnv(Bun.env));

if (!parsed.success) {
  logger.error(
    `Invalid environment configuration:\n\t` +
      parsed.error.issues
        .map((i) => {
          const path = i.path.join(".");
          return `${path} - ${i.message} - ${i.input}`;
        })
        .join("\n\t"),
  );
  process.exit(1);
}

export const config = Object.freeze(parsed.data);

export type TAppConfig = typeof config;
