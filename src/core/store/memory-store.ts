import "server-only";
import type { KvStore } from "./types";

type Entry =
  | { kind: "string"; value: string; expiresAt: number | null }
  | { kind: "hash"; value: Map<string, string> }
  | { kind: "set"; value: Set<string> }
  | { kind: "zset"; value: Map<string, number> };

type Kind = Entry["kind"];
type Values = { string: string; hash: Map<string, string>; set: Set<string>; zset: Map<string, number> };
type ValueOf<K extends Kind> = Values[K];

/**
 * Store em processo para `npm run dev` sem Redis. Não serve para produção:
 * cada instância serverless teria o próprio estado.
 */
export function createMemoryStore(): KvStore {
  const data = new Map<string, Entry>();

  function read(key: string): Entry | undefined {
    const entry = data.get(key);
    if (entry?.kind === "string" && entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      data.delete(key);
      return undefined;
    }
    return entry;
  }

  function typed<K extends Kind>(key: string, kind: K): ValueOf<K> | undefined {
    const entry = read(key);
    if (!entry) return undefined;
    if (entry.kind !== kind) throw new Error(`WRONGTYPE: ${key} é ${entry.kind}, esperado ${kind}`);
    return entry.value as ValueOf<K>;
  }

  function ensure<K extends Kind>(key: string, kind: K, create: () => ValueOf<K>): ValueOf<K> {
    const existing = typed(key, kind);
    if (existing) return existing;
    const value = create();
    data.set(key, { kind, value } as Entry);
    return value;
  }

  // O Redis remove coleções que ficam vazias; imitamos para o comportamento bater.
  function dropIfEmpty(key: string, size: number) {
    if (size === 0) data.delete(key);
  }

  function toRecord(hash: Map<string, string> | undefined) {
    return hash ? Object.fromEntries(hash) : null;
  }

  return {
    async get(key) {
      return typed(key, "string") ?? null;
    },
    async set(key, value) {
      data.set(key, { kind: "string", value, expiresAt: null });
    },
    async setNx(key, value, ttlSeconds) {
      if (read(key)) return false;
      data.set(key, { kind: "string", value, expiresAt: Date.now() + ttlSeconds * 1000 });
      return true;
    },
    async del(...keys) {
      let n = 0;
      for (const key of keys) if (read(key) && data.delete(key)) n++;
      return n;
    },

    async hset(key, fields) {
      const hash = ensure(key, "hash", () => new Map());
      for (const [field, value] of Object.entries(fields)) hash.set(field, value);
    },
    async hgetall(key) {
      return toRecord(typed(key, "hash"));
    },
    async hgetallMany(keys) {
      return keys.map((key) => toRecord(typed(key, "hash")));
    },

    async sadd(key, member) {
      const set = ensure(key, "set", () => new Set());
      if (set.has(member)) return 0;
      set.add(member);
      return 1;
    },
    async srem(key, member) {
      const set = typed(key, "set");
      if (!set?.delete(member)) return 0;
      dropIfEmpty(key, set.size);
      return 1;
    },
    async smembers(key) {
      return [...(typed(key, "set") ?? [])];
    },

    async zadd(key, score, member) {
      ensure(key, "zset", () => new Map()).set(member, score);
    },
    async zincrby(key, increment, member) {
      const zset = ensure(key, "zset", () => new Map());
      const next = (zset.get(member) ?? 0) + increment;
      zset.set(member, next);
      return next;
    },
    async zscore(key, member) {
      return typed(key, "zset")?.get(member) ?? null;
    },
    async zcard(key) {
      return typed(key, "zset")?.size ?? 0;
    },
    async zrem(key, member) {
      const zset = typed(key, "zset");
      if (!zset?.delete(member)) return 0;
      dropIfEmpty(key, zset.size);
      return 1;
    },
    async zall(key) {
      return [...(typed(key, "zset") ?? [])].map(([member, score]) => ({ member, score }));
    },

    async deleteByPrefix(prefix) {
      let n = 0;
      for (const key of [...data.keys()]) {
        if (key.startsWith(prefix) && data.delete(key)) n++;
      }
      return n;
    },
  };
}
