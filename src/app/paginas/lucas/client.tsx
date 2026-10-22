"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const UNITS = [
  { label: "dias", ms: 86_400_000 },
  { label: "horas", ms: 3_600_000 },
  { label: "min", ms: 60_000 },
  { label: "seg", ms: 1_000 },
] as const;

function split(diff: number) {
  let rest = Math.max(0, diff);
  return UNITS.map((u) => {
    const value = Math.floor(rest / u.ms);
    rest -= value * u.ms;
    return { label: u.label, value };
  });
}

export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  // Relógio só no cliente: evita divergência com o HTML do servidor.
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = now === null ? null : new Date(target).getTime() - now;

  if (diff !== null && diff <= 0) {
    return <p className={styles.live}>Tá rolando agora. Cola na praça!</p>;
  }

  return (
    <div className={styles.clock}>
      {split(diff ?? 0).map((part) => (
        <div key={part.label} className={styles.clockCell}>
          <span className={styles.clockValue}>{diff === null ? "--" : String(part.value).padStart(2, "0")}</span>
          <span className={styles.clockLabel}>{part.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ShareButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const data = {
      title: "Jesus na Praça",
      text: "Jesus na Praça · sábado, 31/10, às 19h00. Bora?",
      url: location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(`${data.text} ${data.url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Usuário cancelou o compartilhamento.
    }
  }

  return (
    <button type="button" onClick={share} className={className}>
      {copied ? "Link copiado!" : "Compartilhar →"}
    </button>
  );
}
