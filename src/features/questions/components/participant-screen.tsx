"use client";

import { cn } from "@/shared/lib/cn";
import { useParticipantBoard } from "../client/hooks";
import { QuestionForm } from "./question-form";
import { QuestionList } from "./question-list";

export function ParticipantScreen() {
  const board = useParticipantBoard();
  const offline = board.connectionError;

  return (
    <div className="bg-brand-glow min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-accent-strong/60 bg-black/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-12 w-full max-w-xl items-center justify-between px-4">
          <span className="font-display text-lg tracking-wide uppercase">
            Tech<span className="text-accent">Week</span> <span className="text-muted">26</span>
          </span>
          <span
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.15em] uppercase",
              offline ? "text-danger" : "text-accent",
            )}
          >
            <span className="relative flex size-2">
              {!offline && <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-75" />}
              <span className={cn("relative size-full rounded-full", offline ? "bg-danger" : "bg-accent")} />
            </span>
            {offline ? "Offline" : "Ao vivo"}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 pt-7 pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <section className="flex flex-col gap-2">
          <span className="font-display text-xs tracking-[0.2em] text-accent uppercase">Oficina · Perguntas</span>
          <h1 className="font-display text-[clamp(2.25rem,11vw,3rem)] leading-[1.02] tracking-tight uppercase">
            Mural de <span className="text-accent">perguntas</span>
          </h1>
          <p className="text-[15px] leading-relaxed text-muted">
            Pergunte e vote nas perguntas que você também quer ver respondidas.
          </p>
        </section>

        <QuestionForm onSubmit={board.submitQuestion} />

        {offline && (
          <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm text-danger">
            Sem conexão com o mural. Tentando de novo…
          </p>
        )}
        {board.voteError && (
          <p
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm text-danger"
          >
            {board.voteError}
            <button type="button" onClick={board.clearVoteError} className="-my-2 -mr-1 px-2 py-2 text-xs underline">
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
    </div>
  );
}
