import type { BoardSnapshot, Question, QuestionStatus } from "@/features/questions/domain/types";
import { fetchJson } from "@/shared/lib/fetch-json";

const PIN_HEADER = "x-admin-pin";

export function adminApi(pin: string) {
  const headers = { [PIN_HEADER]: pin };
  return {
    board: () => fetchJson<BoardSnapshot>("/api/admin/board", { headers, cache: "no-store" }),
    setStatus: (id: string, status: QuestionStatus) =>
      fetchJson<Question>(`/api/questions/${encodeURIComponent(id)}`, { method: "PATCH", headers, json: { status } }),
    setSpotlight: (id: string | null) =>
      fetchJson<{ spotlightId: string | null }>("/api/admin/spotlight", { method: "PUT", headers, json: { id } }),
    reset: () => fetchJson<{ deleted: number }>("/api/admin/reset", { method: "POST", headers }),
  };
}

export type AdminApi = ReturnType<typeof adminApi>;
