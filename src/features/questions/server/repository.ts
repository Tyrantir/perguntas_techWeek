import "server-only";
import { z } from "zod";
import { getStore, key, keyPrefix } from "@/core/store";
import { LIMITS } from "../domain/limits";
import { QUESTION_STATUSES, type Question, type QuestionStatus } from "../domain/types";

const keys = {
  question: (id: string) => key("q", id),
  rank: () => key("rank"),
  votes: (id: string) => key("votes", id),
  voter: (voterId: string) => key("voter", voterId),
  spotlight: () => key("spotlight"),
  cooldown: (voterId: string) => key("cooldown", voterId),
};

// Hash do Redis só guarda strings: autor nulo vira "" e createdAt vira texto.
const storedSchema = z.object({
  id: z.string(),
  text: z.string(),
  author: z.string().transform((v) => (v === "" ? null : v)),
  createdAt: z.coerce.number(),
  status: z.enum(QUESTION_STATUSES),
});

function toQuestion(hash: Record<string, string> | null, votes: number): Question | null {
  if (!hash) return null;
  const parsed = storedSchema.safeParse(hash);
  return parsed.success ? { ...parsed.data, votes } : null;
}

export const questionRepository = {
  async count(): Promise<number> {
    return getStore().zcard(keys.rank());
  },

  async create(question: Omit<Question, "votes">): Promise<Question> {
    const store = getStore();
    await store.hset(keys.question(question.id), {
      id: question.id,
      text: question.text,
      author: question.author ?? "",
      createdAt: String(question.createdAt),
      status: question.status,
    });
    await store.zadd(keys.rank(), 0, question.id);
    return { ...question, votes: 0 };
  },

  async findById(id: string): Promise<Question | null> {
    const store = getStore();
    const [hash, score] = await Promise.all([store.hgetall(keys.question(id)), store.zscore(keys.rank(), id)]);
    return toQuestion(hash, score ?? 0);
  },

  async findAll(): Promise<Question[]> {
    const store = getStore();
    const ranked = await store.zall(keys.rank());
    const hashes = await store.hgetallMany(ranked.map(({ member }) => keys.question(member)));
    return ranked.flatMap(({ score }, i) => toQuestion(hashes[i] ?? null, score) ?? []);
  },

  async setStatus(id: string, status: QuestionStatus): Promise<void> {
    await getStore().hset(keys.question(id), { status });
  },

  /**
   * Alterna o voto. SADD/SREM são atômicos e dizem se o set mudou; só quem mudou
   * o set mexe no placar, então cliques simultâneos nunca contam em dobro.
   */
  async toggleVote(id: string, voterId: string): Promise<{ voted: boolean; votes: number }> {
    const store = getStore();
    if ((await store.sadd(keys.votes(id), voterId)) === 1) {
      const [votes] = await Promise.all([
        store.zincrby(keys.rank(), 1, id),
        store.sadd(keys.voter(voterId), id),
      ]);
      return { voted: true, votes };
    }
    if ((await store.srem(keys.votes(id), voterId)) === 0) {
      return { voted: false, votes: (await store.zscore(keys.rank(), id)) ?? 0 };
    }
    const [votes] = await Promise.all([store.zincrby(keys.rank(), -1, id), store.srem(keys.voter(voterId), id)]);
    return { voted: false, votes };
  },

  async votedIds(voterId: string): Promise<string[]> {
    return getStore().smembers(keys.voter(voterId));
  },

  async getSpotlight(): Promise<string | null> {
    return getStore().get(keys.spotlight());
  },

  async setSpotlight(id: string | null): Promise<void> {
    const store = getStore();
    if (id) await store.set(keys.spotlight(), id);
    else await store.del(keys.spotlight());
  },

  /** Retorna false se o votante ainda está no intervalo entre perguntas. */
  async acquireCooldown(voterId: string): Promise<boolean> {
    return getStore().setNx(keys.cooldown(voterId), "1", LIMITS.cooldownSeconds);
  },

  async reset(): Promise<number> {
    return getStore().deleteByPrefix(keyPrefix());
  },
};
