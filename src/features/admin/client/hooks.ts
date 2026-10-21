"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePolling } from "@/shared/hooks/use-polling";
import { ApiError } from "@/shared/lib/fetch-json";
import { adminApi } from "./api";

const PIN_STORAGE_KEY = "mural:admin-pin";

/** PIN em sessionStorage. `undefined` enquanto ainda não leu (evita piscar o formulário de PIN). */
export function useAdminPin() {
  const [pin, setPin] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    try {
      setPin(sessionStorage.getItem(PIN_STORAGE_KEY));
    } catch {
      setPin(null);
    }
  }, []);

  const save = useCallback((value: string) => {
    try {
      sessionStorage.setItem(PIN_STORAGE_KEY, value);
    } catch {}
    setPin(value);
  }, []);

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(PIN_STORAGE_KEY);
    } catch {}
    setPin(null);
  }, []);

  return { pin, save, clear };
}

export function useAdminBoard(pin: string, onUnauthorized: () => void) {
  const api = useMemo(() => adminApi(pin), [pin]);
  const board = usePolling(api.board);
  const { refresh } = board;
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string>();

  useEffect(() => {
    if (board.error instanceof ApiError && board.error.status === 401) onUnauthorized();
  }, [board.error, onUnauthorized]);

  /** Executa uma ação de moderação; `key` identifica o botão ocupado. */
  const run = useCallback(
    async (key: string, action: () => Promise<unknown>) => {
      setBusy(key);
      setActionError(undefined);
      try {
        await action();
        await refresh();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) onUnauthorized();
        setActionError(err instanceof ApiError ? err.message : "A ação falhou. Tente de novo.");
      } finally {
        setBusy(null);
      }
    },
    [refresh, onUnauthorized],
  );

  return { api, board, busy, actionError, run };
}
