"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  intervalMs?: number;
  enabled?: boolean;
};

export type Polling<T> = {
  data: T | undefined;
  error: Error | undefined;
  refresh: () => Promise<void>;
  /** Altera os dados localmente (UI otimista); o próximo poll sobrescreve. */
  mutate: (updater: (current: T | undefined) => T | undefined) => void;
};

/** Busca periódica que pausa com a aba oculta e refaz a busca ao voltar. */
export function usePolling<T>(fetcher: () => Promise<T>, { intervalMs = 2000, enabled = true }: Options = {}): Polling<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error>();
  const fetcherRef = useRef(fetcher);
  const inFlight = useRef(false);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      setData(await fetcherRef.current());
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      if (timer) return;
      void refresh();
      timer = setInterval(() => void refresh(), intervalMs);
    };
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, intervalMs, refresh]);

  const mutate = useCallback((updater: (current: T | undefined) => T | undefined) => setData(updater), []);

  return { data, error, refresh, mutate };
}
