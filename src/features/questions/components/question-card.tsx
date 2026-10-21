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
        "flex gap-3 rounded-2xl border bg-surface p-3 transition-opacity",
        spotlight ? "border-accent shadow-[0_0_0_1px_var(--color-accent)]" : "border-border",
        answered && "opacity-50",
      )}
    >
      <VoteButton
        votes={question.votes}
        voted={voted}
        disabled={answered || voting}
        onClick={() => onVote(question)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
        {spotlight && (
          <span className="text-xs font-semibold tracking-wide text-accent uppercase">Respondendo agora</span>
        )}
        <p className="text-[15px] leading-snug break-words whitespace-pre-line">{question.text}</p>
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
