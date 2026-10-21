export const QUESTION_STATUSES = ["open", "answered", "hidden"] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export type Question = {
  id: string;
  text: string;
  author: string | null;
  createdAt: number;
  status: QuestionStatus;
  votes: number;
};

export type BoardSnapshot = {
  questions: Question[];
  spotlightId: string | null;
  generatedAt: number;
};

export type VoteResult = { voted: boolean; votes: number };

export type MeResponse = { votedIds: string[] };
