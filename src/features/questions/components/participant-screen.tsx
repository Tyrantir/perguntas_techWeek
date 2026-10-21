"use client";

import { useParticipantBoard } from "../client/hooks";
import { QuestionForm } from "./question-form";
import { QuestionList } from "./question-list";

export function ParticipantScreen() {
  const board = useParticipantBoard();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-5 px-4 pt-6 pb-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Mural de <span className="text-accent">perguntas</span>
        </h1>
        <p className="text-sm text-muted">Pergunte e vote nas perguntas que você também quer ver respondidas.</p>
      </header>

      <QuestionForm onSubmit={board.submitQuestion} />

      {board.connectionError && (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          Sem conexão com o mural. Tentando de novo…
        </p>
      )}
      {board.voteError && (
        <p role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {board.voteError}
          <button type="button" onClick={board.clearVoteError} className="text-xs underline">
            Fechar
          </button>
        </p>
      )}

      <QuestionList
        questions={board.questions}
        spotlightId={board.spotlightId}
        votedIds={board.votedIds}
        votingIds={board.votingIds}
        loading={board.loading}
        onVote={(q) => void board.toggleVote(q)}
      />
    </main>
  );
}
