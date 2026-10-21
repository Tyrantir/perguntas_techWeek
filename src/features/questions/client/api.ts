import { fetchJson } from "@/shared/lib/fetch-json";
import type { BoardSnapshot, MeResponse, Question, VoteResult } from "../domain/types";

export type NewQuestion = { text: string; author: string | null };

export const questionsApi = {
  // Sem `cache: "no-store"`: esse modo faz o navegador mandar `Cache-Control: no-cache`, o que derrubaria o cache da CDN.
  board: () => fetchJson<BoardSnapshot>("/api/questions"),
  me: () => fetchJson<MeResponse>("/api/me", { cache: "no-store" }),
  create: (input: NewQuestion) => fetchJson<Question>("/api/questions", { method: "POST", json: input }),
  toggleVote: (id: string) =>
    fetchJson<VoteResult>(`/api/questions/${encodeURIComponent(id)}/vote`, { method: "POST" }),
};
