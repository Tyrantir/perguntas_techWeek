import type { Question, QuestionStatus } from "./types";

const STATUS_ORDER: Record<QuestionStatus, number> = { open: 0, answered: 1, hidden: 2 };

/** Abertas primeiro, respondidas depois, ocultas por último; dentro de cada grupo, mais votos e depois mais antigas. */
export function compareByRank(a: Question, b: Question): number {
  return STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.votes - a.votes || a.createdAt - b.createdAt;
}

/** Mais recentes primeiro, respondidas no fim. */
export function compareByRecent(a: Question, b: Question): number {
  return STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.createdAt - a.createdAt;
}

export function sortByRank(questions: readonly Question[]): Question[] {
  return [...questions].sort(compareByRank);
}

export function sortByRecent(questions: readonly Question[]): Question[] {
  return [...questions].sort(compareByRecent);
}
