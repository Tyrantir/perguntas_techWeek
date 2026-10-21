"use client";

import { useId, useState, type FormEvent } from "react";
import { ApiError } from "@/shared/lib/fetch-json";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { adminApi } from "../client/api";

export function PinGate({ onUnlock }: { onUnlock: (pin: string) => void }) {
  const inputId = useId();
  const [pin, setPin] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = pin.trim();
    if (!value) return;
    setChecking(true);
    setError(undefined);
    try {
      await adminApi(value).board();
      onUnlock(value);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível validar o PIN");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <Card className="w-full max-w-sm p-6">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-semibold">Moderação</h1>
            <p className="mt-1 text-sm text-muted">Digite o PIN do admin para continuar.</p>
          </div>
          <label htmlFor={inputId} className="sr-only">
            PIN
          </label>
          <input
            id={inputId}
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="h-12 rounded-xl border border-border bg-bg px-3 text-center text-lg tracking-[0.4em] focus:border-accent focus:outline-none"
          />
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" disabled={checking || !pin.trim()}>
            {checking ? "Verificando…" : "Entrar"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
