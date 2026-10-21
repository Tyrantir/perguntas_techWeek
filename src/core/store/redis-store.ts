import "server-only";
import { Redis } from "@upstash/redis";
import type { RedisConfig } from "@/core/config/env";
import type { KvStore, ScoredMember } from "./types";

export function createRedisStore(config: RedisConfig): KvStore {
  // Sem deserialização automática: os hashes guardam strings e o domínio faz o parse.
  const redis = new Redis({ ...config, automaticDeserialization: false });

  return {
    async get(key) {
      return redis.get<string>(key);
    },
    async set(key, value) {
      await redis.set(key, value);
    },
    async setNx(key, value, ttlSeconds) {
      const res = await redis.set(key, value, { nx: true, ex: ttlSeconds });
      return res === "OK";
    },
    async del(...keys) {
      return keys.length ? redis.del(...keys) : 0;
    },

    async hset(key, fields) {
      await redis.hset(key, fields);
    },
    async hgetall(key) {
      return redis.hgetall<Record<string, string>>(key);
    },
    async hgetallMany(keys) {
      if (keys.length === 0) return [];
      const pipe = redis.pipeline();
      for (const key of keys) pipe.hgetall(key);
      return pipe.exec<(Record<string, string> | null)[]>();
    },

    async sadd(key, member) {
      return redis.sadd(key, member);
    },
    async srem(key, member) {
      return redis.srem(key, member);
    },
    async smembers(key) {
      return redis.smembers<string[]>(key);
    },

    async zadd(key, score, member) {
      await redis.zadd(key, { score, member });
    },
    async zincrby(key, increment, member) {
      return Number(await redis.zincrby(key, increment, member));
    },
    async zscore(key, member) {
      const score = await redis.zscore(key, member);
      return score === null ? null : Number(score);
    },
    async zcard(key) {
      return redis.zcard(key);
    },
    async zrem(key, member) {
      return redis.zrem(key, member);
    },
    async zall(key) {
      // Com withScores a Upstash devolve uma lista plana: [membro, score, membro, score, ...].
      const flat = await redis.zrange<string[]>(key, 0, -1, { withScores: true });
      const out: ScoredMember[] = [];
      for (let i = 0; i + 1 < flat.length; i += 2) {
        out.push({ member: String(flat[i]), score: Number(flat[i + 1]) });
      }
      return out;
    },

    async deleteByPrefix(prefix) {
      let cursor = "0";
      let deleted = 0;
      do {
        const [next, keys] = await redis.scan(cursor, { match: `${prefix}*`, count: 200 });
        cursor = String(next);
        if (keys.length) deleted += await redis.del(...keys);
      } while (cursor !== "0");
      return deleted;
    },
  };
}
