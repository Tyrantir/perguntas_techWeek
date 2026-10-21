"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useAdminBoard } from "../client/hooks";
import { AdminQuestionRow } from "./admin-question-row";

export function AdminPanel({ pin, onLogout }: { pin: string; onLogout: () => void }) {
  const { api, board, busy, actionError, run } = useAdminBoard(pin, onLogout);
  const [confirmReset, setConfirmReset] = useState(false);
  const questions = board.data?.questions ?? [];
  const spotlightId = board.data?.spotlightId ?? null;
  const counts = {
    open: questions.filter((q) => q.status === "open").length,
    answered: questions.filter((q) => q.status === "answered").length,
    hidden: questions.filter((q) => q.status === "hidden").length,
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-5 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Moderação</h1>
          <p className="text-sm text-muted">
            {counts.open} abertas · {counts.answered} respondidas · {counts.hidden} ocultas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/telao"
            target="_blank"
            rel="noopener"
            className="inline-flex h-10 items-center rounded-lg border border-border bg-surface-2 px-4 text-sm font-medium hover:border-accent/60"
          >
            Abrir telão ↗
          </a>
          <Button variant="ghost" onClick={onLogout}>
            Sair
          </Button>
        </div>
      </header>

      {(actionError || board.error) && (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {actionError ?? "Sem conexão com o servidor. Tentando de novo…"}
        </p>
      )}

      {board.data === undefined ? (
        <p className="py-10 text-center text-sm text-muted">Carregando…</p>
      ) : questions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          Nenhuma pergunta no mural.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {questions.map((q) => (
            <AdminQuestionRow
              key={q.id}
              question={q}
              spotlight={q.id === spotlightId}
              busy={busy}
              onSpotlight={(id) => void run(q.id, () => api.setSpotlight(id))}
              onStatus={(status) => void run(q.id, () => api.setStatus(q.id, status))}
            />
          ))}
        </ul>
      )}

      <section className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/30 p-4">
        <div>
          <h2 className="font-medium">Zerar mural</h2>
          <p className="text-sm text-muted">Apaga todas as perguntas, votos e o destaque. Não dá para desfazer.</p>
        </div>
        {confirmReset ? (
          <div className="flex gap-2">
            <Button variant="ghost" disabled={busy !== null} onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              disabled={busy !== null}
              onClick={() =>
                void run("reset", async () => {
                  await api.reset();
                  setConfirmReset(false);
                })
              }
            >
              {busy === "reset" ? "Apagando…" : "Sim, apagar tudo"}
            </Button>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            Zerar mural
          </Button>
        )}
      </section>
    </main>
  );
}
