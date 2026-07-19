import "dotenv/config";
import { z } from "zod";

const envSchema = z
  .object({
    PORT: z.coerce.number().default(3000),

    DATABASE_URL: z.string().optional(),

    DB_HOST: z.string().optional(),
    DB_PORT: z.coerce.number().optional(),
    DB_NAME: z.string().optional(),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),

    KAFKA_BROKERS: z.string().default("localhost:9092"),
    KAFKA_CLIENT_ID: z.string(),
    KAFKA_GROUP_ID: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.DATABASE_URL) {
      const missing = [
        "DB_HOST",
        "DB_PORT",
        "DB_NAME",
        "DB_USER",
        "DB_PASSWORD",
      ].filter((key) => !data[key as keyof typeof data]);

      if (missing.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Faltan variables de entorno: ${missing.join(", ")}`,
        });
      }
    }
  });

const parsed = envSchema.parse(process.env);

const DATABASE_URL =
  parsed.DATABASE_URL ??
  `postgresql://${parsed.DB_USER}:${parsed.DB_PASSWORD}@${parsed.DB_HOST}:${parsed.DB_PORT}/${parsed.DB_NAME}`;

export const env = {
  ...parsed,
  DATABASE_URL,
};