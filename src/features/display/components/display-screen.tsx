"use client";

import { useMemo } from "react";
import { useBoard } from "@/features/questions/client/hooks";
import { cn } from "@/shared/lib/cn";
import { JoinQr } from "./join-qr";
import { Ranking } from "./ranking";
import { SpotlightCard } from "./spotlight-card";

const TOP_N = 7;

export function DisplayScreen() {
  const { data, error } = useBoard();

  const view = useMemo(() => {
    const questions = data?.questions ?? [];
    const spotlight = questions.find((q) => q.id === data?.spotlightId) ?? null;
    return {
      spotlight,
      // O board já vem ordenado: abertas por votos, respondidas no fim.
      top: questions.filter((q) => q.status === "open" && q.id !== spotlight?.id).slice(0, TOP_N),
      stats: [
        { label: "perguntas", value: questions.length },
        { label: "votos", value: questions.reduce((sum, q) => sum + q.votes, 0) },
        { label: "respondidas", value: questions.filter((q) => q.status === "answered").length },
      ],
    };
  }, [data]);

  return (
    <main className="grid h-dvh grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-[5vh] overflow-hidden p-[5vh]">
      <aside className="flex min-h-0 flex-col justify-between gap-[4vh]">
        <header>
          <h1 className="text-[6vh] leading-[1.05] font-bold tracking-tight">
            Mural de <span className="text-accent">perguntas</span>
          </h1>
          <p className="mt-[1.5vh] text-[2.6vh] text-muted">Escaneie, pergunte e vote nas perguntas dos outros.</p>
        </header>

        <JoinQr />

        <dl className="grid grid-cols-3 gap-[2vh]">
          {view.stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col-reverse gap-[0.8vh] rounded-[2vh] border border-border bg-surface px-[2vh] py-[1.8vh]"
            >
              <dt className="text-[1.9vh] tracking-wide text-muted uppercase">{s.label}</dt>
              <dd className="text-[5vh] leading-none font-bold tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
      </aside>

      <section className="flex min-h-0 flex-col gap-[3vh]">
        <div className="flex items-center justify-between">
          <h2 className="text-[3vh] font-semibold">Mais votadas</h2>
          <LiveIndicator offline={Boolean(error)} />
        </div>
        {view.spotlight && <SpotlightCard question={view.spotlight} />}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {data && <Ranking questions={view.top} slots={TOP_N} compact={view.spotlight !== null} />}
        </div>
      </section>
    </main>
  );
}

function LiveIndicator({ offline }: { offline: boolean }) {
  return (
    <span className={cn("flex items-center gap-[1vh] text-[2vh] font-medium", offline ? "text-danger" : "text-muted")}>
      <span className="relative flex size-[1.4vh]">
        {!offline && <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-75" />}
        <span className={cn("relative size-full rounded-full", offline ? "bg-danger" : "bg-accent")} />
      </span>
      {offline ? "reconectando…" : "ao vivo"}
    </span>
  );
}
