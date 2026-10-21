import "server-only";
import { env } from "@/core/config/env";
import { createMemoryStore } from "./memory-store";
import { createRedisStore } from "./redis-store";
import type { KvStore } from "./types";

export type { KvStore, ScoredMember } from "./types";

// globalThis sobrevive ao HMR do dev server; sem isso o store em memória zeraria a cada edição.
const globalForStore = globalThis as typeof globalThis & { __muralStore?: KvStore };

export function getStore(): KvStore {
  if (globalForStore.__muralStore) return globalForStore.__muralStore;

  const { redis, isProduction } = env();
  if (redis) {
    globalForStore.__muralStore = createRedisStore(redis);
  } else {
    if (isProduction) {
      console.warn(
        "[mural] Redis não configurado: usando store em memória. Os dados não são compartilhados entre instâncias.",
      );
    }
    globalForStore.__muralStore = createMemoryStore();
  }
  return globalForStore.__muralStore;
}

/** Monta chaves com o prefixo do mural (`MURAL_PREFIX`). */
export function key(...parts: string[]): string {
  return [env().prefix, ...parts].join(":");
}

export function keyPrefix(): string {
  return `${env().prefix}:`;
}
