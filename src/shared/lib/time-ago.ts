const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** "agora", "há 3 minutos", "há 2 horas"... */
export function timeAgo(timestamp: number, now: number = Date.now()): string {
  const seconds = Math.round((timestamp - now) / 1000);
  if (Math.abs(seconds) < 45) return "agora";
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(-1, "minute");
}
