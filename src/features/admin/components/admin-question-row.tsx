"use client";

import type { Question, QuestionStatus } from "@/features/questions/domain/types";
import { cn } from "@/shared/lib/cn";
import { timeAgo } from "@/shared/lib/time-ago";
import { Button } from "@/shared/ui/button";

const STATUS_LABEL: Record<QuestionStatus, { text: string; className: string }> = {
  open: { text: "Aberta", className: "bg-surface-2 text-muted" },
  answered: { text: "Respondida", className: "bg-success/15 text-success" },
  hidden: { text: "Oculta", className: "bg-danger/15 text-danger" },
};

type Props = {
  question: Question;
  spotlight: boolean;
  busy: string | null;
  onSpotlight: (id: string | null) => void;
  onStatus: (status: QuestionStatus) => void;
};

export function AdminQuestionRow({ question: q, spotlight, busy, onSpotlight, onStatus }: Props) {
  const status = STATUS_LABEL[q.status];
  const disabled = busy !== null;

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-surface p-4 sm:flex-row sm:items-start",
        spotlight ? "border-accent" : "border-border",
        q.status === "hidden" && "opacity-60",
      )}
    >
      <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-surface-2 py-2 max-sm:hidden">
        <span className="text-lg font-semibold tabular-nums">{q.votes}</span>
        <span className="text-[10px] tracking-wide text-muted uppercase">votos</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={cn("rounded-full px-2 py-0.5 font-medium", status.className)}>{status.text}</span>
          {spotlight && <span className="rounded-full bg-accent/15 px-2 py-0.5 font-medium text-accent">Em destaque</span>}
          <span className="text-muted sm:hidden">{q.votes} votos ·</span>
          <span className="text-muted">
            {q.author ?? "Anônimo"} · {timeAgo(q.createdAt)}
          </span>
        </div>
        <p className="leading-snug break-words whitespace-pre-line">{q.text}</p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2 sm:w-56 sm:justify-end">
        {spotlight ? (
          <Button size="sm" variant="secondary" disabled={disabled} onClick={() => onSpotlight(null)}>
            Tirar destaque
          </Button>
        ) : (
          q.status !== "hidden" && (
            <Button size="sm" disabled={disabled} onClick={() => onSpotlight(q.id)}>
              Destacar
            </Button>
          )
        )}
        {q.status === "open" && (
          <Button size="sm" variant="secondary" disabled={disabled} onClick={() => onStatus("answered")}>
            Respondida
          </Button>
        )}
        {q.status !== "open" && (
          <Button size="sm" variant="secondary" disabled={disabled} onClick={() => onStatus("open")}>
            Reabrir
          </Button>
        )}
        {q.status !== "hidden" && (
          <Button size="sm" variant="danger" disabled={disabled} onClick={() => onStatus("hidden")}>
            Ocultar
          </Button>
        )}
      </div>
    </li>
  );
}
