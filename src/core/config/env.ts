import "server-only";
import { z } from "zod";

const optional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  KV_REST_API_URL: optional,
  KV_REST_API_TOKEN: optional,
  UPSTASH_REDIS_REST_URL: optional,
  UPSTASH_REDIS_REST_TOKEN: optional,
  ADMIN_PIN: optional,
  MURAL_PREFIX: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_-]+$/, "MURAL_PREFIX aceita apenas letras, números, _ e -")
    .default("mural"),
});

export type RedisConfig = { url: string; token: string };

export type Env = {
  isProduction: boolean;
  redis: RedisConfig | null;
  adminPin: string | null;
  prefix: string;
};

function load(): Env {
  const raw = schema.parse(process.env);
  // A integração da Vercel injeta KV_*; quem cria o banco direto na Upstash recebe UPSTASH_*.
  const url = raw.KV_REST_API_URL ?? raw.UPSTASH_REDIS_REST_URL;
  const token = raw.KV_REST_API_TOKEN ?? raw.UPSTASH_REDIS_REST_TOKEN;
  const isProduction = raw.NODE_ENV === "production";

  return {
    isProduction,
    redis: url && token ? { url, token } : null,
    // Em dev o PIN padrão é "1234" para o app rodar sem configuração; em produção, sem ADMIN_PIN o admin fica desligado.
    adminPin: raw.ADMIN_PIN ?? (isProduction ? null : "1234"),
    prefix: raw.MURAL_PREFIX,
  };
}

let cached: Env | undefined;

export function env(): Env {
  cached ??= load();
  return cached;
}
