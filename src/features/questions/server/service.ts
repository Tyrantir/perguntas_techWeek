import "server-only";
import { randomUUID } from "node:crypto";
import { AppError } from "@/core/http/errors";
import { LIMITS } from "../domain/limits";
import { createQuestionSchema, questionIdSchema, spotlightSchema, updateStatusSchema } from "../domain/schemas";
import { sortByRank } from "../domain/sort";
import type { BoardSnapshot, MeResponse, Question, VoteResult } from "../domain/types";
import { questionRepository as repo } from "./repository";

async function requireQuestion(rawId: string): Promise<Question> {
  const id = questionIdSchema.parse(rawId);
  const question = await repo.findById(id);
  if (!question) throw new AppError(404, "NOT_FOUND", "Pergunta não encontrada");
  return question;
}

export const questionService = {
  async getBoard({ includeHidden = false } = {}): Promise<BoardSnapshot> {
    const [all, spotlightId] = await Promise.all([repo.findAll(), repo.getSpotlight()]);
    const questions = sortByRank(includeHidden ? all : all.filter((q) => q.status !== "hidden"));
    return {
      questions,
      // Destaque de pergunta apagada ou oculta não aparece no board público.
      spotlightId: spotlightId && questions.some((q) => q.id === spotlightId) ? spotlightId : null,
      generatedAt: Date.now(),
    };
  },

  async create(voterId: string, rawInput: unknown): Promise<Question> {
    const input = createQuestionSchema.parse(rawInput);

    if ((await repo.count()) >= LIMITS.maxQuestions) {
      throw new AppError(409, "LIMIT_REACHED", "O mural atingiu o limite de perguntas");
    }
    if (!(await repo.acquireCooldown(voterId))) {
      throw new AppError(
        429,
        "RATE_LIMITED",
        `Aguarde ${LIMITS.cooldownSeconds} segundos entre uma pergunta e outra`,
      );
    }

    return repo.create({
      id: randomUUID(),
      text: input.text,
      author: input.author,
      createdAt: Date.now(),
      status: "open",
    });
  },

  async toggleVote(voterId: string, rawId: string): Promise<VoteResult> {
    const question = await requireQuestion(rawId);
    if (question.status === "hidden") throw new AppError(404, "NOT_FOUND", "Pergunta não encontrada");
    if (question.status === "answered") {
      throw new AppError(409, "CONFLICT", "Esta pergunta já foi respondida");
    }
    return repo.toggleVote(question.id, voterId);
  },

  async getMe(voterId: string | null): Promise<MeResponse> {
    return { votedIds: voterId ? await repo.votedIds(voterId) : [] };
  },

  async setStatus(rawId: string, rawInput: unknown): Promise<Question> {
    const question = await requireQuestion(rawId);
    const { status } = updateStatusSchema.parse(rawInput);
    await repo.setStatus(question.id, status);

    // Responder ou ocultar encerra o destaque: o telão não deve continuar mostrando essa pergunta.
    if (status !== "open" && (await repo.getSpotlight()) === question.id) {
      await repo.setSpotlight(null);
    }
    return { ...question, status };
  },

  async setSpotlight(rawInput: unknown): Promise<{ spotlightId: string | null }> {
    const { id } = spotlightSchema.parse(rawInput);
    if (id) {
      const question = await requireQuestion(id);
      if (question.status === "hidden") {
        throw new AppError(409, "CONFLICT", "Não é possível destacar uma pergunta oculta");
      }
    }
    await repo.setSpotlight(id);
    return { spotlightId: id };
  },

  async reset(): Promise<{ deleted: number }> {
    return { deleted: await repo.reset() };
  },
};
