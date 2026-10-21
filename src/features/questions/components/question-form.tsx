"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { ApiError } from "@/shared/lib/fetch-json";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { LIMITS } from "../domain/limits";
import type { NewQuestion } from "../client/api";

const AUTHOR_STORAGE_KEY = "mural:author";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

export function QuestionForm({ onSubmit }: { onSubmit: (input: NewQuestion) => Promise<unknown> }) {
  const textId = useId();
  const authorId = useId();
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(0);

  // localStorage só existe no navegador; ler no render causaria hydration mismatch.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTHOR_STORAGE_KEY);
      if (saved) setAuthor(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (cooldownUntil <= now) return;
    const timer = setTimeout(() => setNow(Date.now()), 250);
    return () => clearTimeout(timer);
  }, [cooldownUntil, now]);

  const trimmedLength = text.trim().length;
  const cooldownLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const canSubmit = trimmedLength >= LIMITS.textMin && status.kind !== "sending" && cooldownLeft === 0;

  function changeAuthor(value: string) {
    setAuthor(value);
    try {
      localStorage.setItem(AUTHOR_STORAGE_KEY, value.trim());
    } catch {}
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSubmit) return;
    setStatus({ kind: "sending" });
    try {
      await onSubmit({ text: text.trim(), author: author.trim() || null });
      setText("");
      setStatus({ kind: "sent" });
      const start = Date.now();
      setNow(start);
      setCooldownUntil(start + LIMITS.cooldownSeconds * 1000);
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof ApiError ? err.message : "Não foi possível enviar. Tente de novo.",
      });
    }
  }

  return (
    <Card className="p-0">
      <form onSubmit={submit} className="flex flex-col gap-3 p-4">
        <label htmlFor={textId} className="text-sm font-medium text-muted">
          Sua pergunta
        </label>
        <textarea
          id={textId}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (status.kind !== "sending") setStatus({ kind: "idle" });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void submit();
          }}
          maxLength={LIMITS.textMax}
          rows={3}
          placeholder="O que você quer perguntar?"
          className="w-full resize-none rounded-xl border border-border bg-bg px-3 py-2.5 text-base leading-relaxed placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">
            {trimmedLength > 0 && trimmedLength < LIMITS.textMin
              ? `Mínimo de ${LIMITS.textMin} caracteres`
              : " "}
          </span>
          <span
            className={cn("tabular-nums", text.length >= LIMITS.textMax - 20 ? "text-accent" : "text-muted")}
            aria-live="polite"
          >
            {text.length}/{LIMITS.textMax}
          </span>
        </div>

        <label htmlFor={authorId} className="sr-only">
          Seu nome (opcional)
        </label>
        <input
          id={authorId}
          value={author}
          onChange={(e) => changeAuthor(e.target.value)}
          maxLength={LIMITS.authorMax}
          placeholder="Seu nome (opcional)"
          autoComplete="name"
          className="h-11 w-full rounded-xl border border-border bg-bg px-3 text-base placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />

        <Button type="submit" size="lg" disabled={!canSubmit}>
          {status.kind === "sending"
            ? "Enviando…"
            : cooldownLeft > 0
              ? `Aguarde ${cooldownLeft}s`
              : "Enviar pergunta"}
        </Button>

        <p
          role="status"
          className={cn(
            "min-h-5 text-sm",
            status.kind === "error" ? "text-danger" : "text-success",
            status.kind !== "error" && status.kind !== "sent" && "invisible",
          )}
        >
          {status.kind === "error" ? status.message : status.kind === "sent" ? "Pergunta enviada!" : " "}
        </p>
      </form>
    </Card>
  );
}
