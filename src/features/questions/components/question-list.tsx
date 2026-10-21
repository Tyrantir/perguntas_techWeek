"use client";

import { useMemo, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { sortByRank, sortByRecent } from "../domain/sort";
import type { Question } from "../domain/types";
import { QuestionCard } from "./question-card";

type Tab = "top" | "recent";

const TABS: { id: Tab; label: string }[] = [
  { id: "top", label: "Mais votadas" },
  { id: "recent", label: "Recentes" },
];

type Props = {
  questions: Question[];
  spotlightId: string | null;
  votedIds: ReadonlySet<string>;
  votingIds: ReadonlySet<string>;
  loading: boolean;
  onVote: (question: Question) => void;
};

export function QuestionList({ questions, spotlightId, votedIds, votingIds, loading, onVote }: Props) {
  const [tab, setTab] = useState<Tab>("top");
  const sorted = useMemo(() => (tab === "top" ? sortByRank(questions) : sortByRecent(questions)), [tab, questions]);

  return (
    <section className="flex flex-col gap-3">
      <div role="tablist" aria-label="Ordenação" className="grid grid-cols-2 rounded-xl border border-border bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "h-9 rounded-lg text-sm font-medium transition-colors",
              tab === t.id ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ul className="flex flex-col gap-2" aria-busy>
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </ul>
      ) : sorted.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          Nenhuma pergunta ainda. Seja a primeira pessoa a perguntar!
        </p>
      ) : (
        <ul role="tabpanel" className="flex flex-col gap-2">
          {sorted.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              voted={votedIds.has(q.id)}
              voting={votingIds.has(q.id)}
              spotlight={q.id === spotlightId}
              onVote={onVote}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
