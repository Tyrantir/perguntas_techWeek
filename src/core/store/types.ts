export type ScoredMember = { member: string; score: number };

/**
 * Subconjunto de comandos Redis usado pelo app. As chaves são absolutas:
 * quem chama aplica o prefixo.
 */
export interface KvStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  /** SET NX EX: retorna true se a chave foi criada. */
  setNx(key: string, value: string, ttlSeconds: number): Promise<boolean>;
  del(...keys: string[]): Promise<number>;

  hset(key: string, fields: Record<string, string>): Promise<void>;
  hgetall(key: string): Promise<Record<string, string> | null>;
  hgetallMany(keys: string[]): Promise<(Record<string, string> | null)[]>;

  sadd(key: string, member: string): Promise<number>;
  srem(key: string, member: string): Promise<number>;
  smembers(key: string): Promise<string[]>;

  zadd(key: string, score: number, member: string): Promise<void>;
  zincrby(key: string, increment: number, member: string): Promise<number>;
  zscore(key: string, member: string): Promise<number | null>;
  zcard(key: string): Promise<number>;
  zrem(key: string, member: string): Promise<number>;
  /** Todos os membros com score, sem ordem garantida. */
  zall(key: string): Promise<ScoredMember[]>;

  /** Apaga todas as chaves que começam com `prefix`. */
  deleteByPrefix(prefix: string): Promise<number>;
}
