"use client";

import { cn } from "@/shared/lib/cn";

type Props = {
  votes: number;
  voted: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function VoteButton({ votes, voted, disabled, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={voted}
      aria-label={voted ? `Remover voto (${votes} votos)` : `Votar (${votes} votos)`}
      className={cn(
        "flex min-h-16 w-14 shrink-0 flex-col items-center justify-center gap-0.5 self-start rounded-xl border py-2 transition-[colors,transform] active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        voted
          ? "border-accent bg-accent/15 text-accent shadow-[0_0_16px_rgb(191_64_255/0.25)]"
          : "border-border bg-surface-2 text-muted hover:border-accent/60 hover:text-fg",
        "disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-muted",
      )}
    >
      <svg viewBox="0 0 20 20" aria-hidden className="size-4" fill="currentColor">
        <path d="M10 4.5 16 12H4l6-7.5Z" />
      </svg>
      <span className="text-base font-bold tabular-nums">{votes}</span>
    </button>
  );
}
