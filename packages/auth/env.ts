/* eslint-disable no-restricted-properties */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(1),
    ACCESS_SERVICE_PORT: z
      .string()
      .transform((val) => parseInt(val, 10))
      .default("4001"),
    USER_SERVICE_PORT: z
      .string()
      .transform((val) => parseInt(val, 10))
      .default("4000"),
    INTERNAL_API_SECRET: z.string().min(1),
    NODE_ENV: z.enum(["development", "production"]).optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
