"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePolling } from "@/shared/hooks/use-polling";
import { ApiError } from "@/shared/lib/fetch-json";
import type { BoardSnapshot, Question } from "../domain/types";
import { questionsApi, type NewQuestion } from "./api";

/**
 * O board público vem da CDN e pode chegar até ~3s atrasado (s-maxage=1 + swr=2).
 * Mudanças locais ficam sobrepostas por esse tempo para o voto/pergunta recém-enviados
 * não "piscarem" de volta ao valor antigo.
 */
const LOCAL_OVERRIDE_MS = 4000;

type VoteOverride = { votes: number; until: number };
type PendingQuestion = { question: Question; until: number };

export function useBoard() {
  return usePolling(questionsApi.board);
}

export function useParticipantBoard() {
  const board = useBoard();
  const { refresh } = board;
  const [votedIds, setVotedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [voteOverrides, setVoteOverrides] = useState<ReadonlyMap<string, VoteOverride>>(() => new Map());
  const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>([]);
  const [votingIds, setVotingIds] = useState<ReadonlySet<string>>(() => new Set());
  const [voteError, setVoteError] = useState<string>();

  useEffect(() => {
    questionsApi
      .me()
      .then(({ votedIds }) => setVotedIds(new Set(votedIds)))
      .catch(() => {});
  }, []);

  const questions = useMemo(() => mergeLocal(board.data, voteOverrides, pendingQuestions), [
    board.data,
    voteOverrides,
    pendingQuestions,
  ]);

  const toggleVote = useCallback(
    async (question: Question) => {
      const { id } = question;
      if (votingIds.has(id)) return;
      const wasVoted = votedIds.has(id);
      const previousOverride = voteOverrides.get(id);

      setVoteError(undefined);
      setVotingIds((s) => withItem(s, id, true));
      setVotedIds((s) => withItem(s, id, !wasVoted));
      setVoteOverrides((m) => withEntry(m, id, question.votes + (wasVoted ? -1 : 1)));

      try {
        const result = await questionsApi.toggleVote(id);
        setVotedIds((s) => withItem(s, id, result.voted));
        setVoteOverrides((m) => withEntry(m, id, result.votes));
      } catch (err) {
        setVotedIds((s) => withItem(s, id, wasVoted));
        setVoteOverrides((m) => {
          const next = new Map(m);
          if (previousOverride) next.set(id, previousOverride);
          else next.delete(id);
          return next;
        });
        setVoteError(err instanceof ApiError ? err.message : "Não foi possível registrar o voto");
        if (err instanceof ApiError && (err.status === 404 || err.status === 409)) void refresh();
      } finally {
        setVotingIds((s) => withItem(s, id, false));
      }
    },
    [votingIds, votedIds, voteOverrides, refresh],
  );

  const submitQuestion = useCallback(
    async (input: NewQuestion) => {
      const question = await questionsApi.create(input);
      setPendingQuestions((list) => [...list, { question, until: Date.now() + LOCAL_OVERRIDE_MS }]);
      void refresh();
      return question;
    },
    [refresh],
  );

  return {
    loading: board.data === undefined && board.error === undefined,
    connectionError: board.error,
    spotlightId: board.data?.spotlightId ?? null,
    questions,
    votedIds,
    votingIds,
    voteError,
    clearVoteError: () => setVoteError(undefined),
    toggleVote,
    submitQuestion,
  };
}

function mergeLocal(
  snapshot: BoardSnapshot | undefined,
  overrides: ReadonlyMap<string, VoteOverride>,
  pending: PendingQuestion[],
): Question[] {
  if (!snapshot) return [];
  const now = Date.now();
  const ids = new Set(snapshot.questions.map((q) => q.id));
  const merged = snapshot.questions.map((q) => {
    const o = overrides.get(q.id);
    return o && o.until > now ? { ...q, votes: o.votes } : q;
  });
  for (const p of pending) {
    if (p.until > now && !ids.has(p.question.id)) merged.push(p.question);
  }
  return merged;
}

function withItem(set: ReadonlySet<string>, id: string, present: boolean): ReadonlySet<string> {
  if (set.has(id) === present) return set;
  const next = new Set(set);
  if (present) next.add(id);
  else next.delete(id);
  return next;
}

function withEntry(map: ReadonlyMap<string, VoteOverride>, id: string, votes: number) {
  return new Map(map).set(id, { votes, until: Date.now() + LOCAL_OVERRIDE_MS });
}
