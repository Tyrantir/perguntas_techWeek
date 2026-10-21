import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/core/config/env";

const COOKIE = "mural_voter";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Id anônimo do navegador atual, ou null se ainda não houver cookie válido. */
export async function getVoterId(): Promise<string | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  return value && UUID_RE.test(value) ? value : null;
}

/** Retorna o id do votante, criando o cookie se necessário. Só pode ser chamado em route handlers/actions. */
export async function ensureVoterId(): Promise<string> {
  const existing = await getVoterId();
  if (existing) return existing;

  const id = randomUUID();
  (await cookies()).set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: env().isProduction,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return id;
}
