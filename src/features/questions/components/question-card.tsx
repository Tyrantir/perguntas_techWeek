"use client";

import { cn } from "@/shared/lib/cn";
import { timeAgo } from "@/shared/lib/time-ago";
import type { Question } from "../domain/types";
import { VoteButton } from "./vote-button";

type Props = {
  question: Question;
  voted: boolean;
  voting: boolean;
  spotlight: boolean;
  onVote: (question: Question) => void;
};

export function QuestionCard({ question, voted, voting, spotlight, onVote }: Props) {
  const answered = question.status === "answered";

  return (
    <li
      className={cn(
        "relative flex gap-3 overflow-hidden rounded-2xl border bg-surface p-3.5 transition-[opacity,border-color]",
        spotlight ? "border-accent-strong shadow-[0_0_24px_rgb(94_0_135/0.55)]" : "border-border",
        answered && "opacity-50",
      )}
    >
      {spotlight && <span aria-hidden className="bg-brand-gradient absolute inset-x-0 top-0 h-0.5" />}
      <VoteButton
        votes={question.votes}
        voted={voted}
        disabled={answered || voting}
        onClick={() => onVote(question)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        {spotlight && (
          <span className="font-display text-xs tracking-[0.2em] text-accent uppercase">Respondendo agora</span>
        )}
        <p className="text-base leading-snug break-words whitespace-pre-line">{question.text}</p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
          <span>{question.author ?? "Anônimo"}</span>
          <span aria-hidden>·</span>
          <time dateTime={new Date(question.createdAt).toISOString()}>{timeAgo(question.createdAt)}</time>
          {answered && (
            <>
              <span aria-hidden>·</span>
              <span className="text-success">Respondida</span>
            </>
          )}
        </p>
      </div>
    </li>
  );
}
