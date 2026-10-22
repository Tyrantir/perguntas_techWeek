"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const ENDPOINT =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/conmebol.libertadores/scoreboard?dates=20261021";
const EVENT_ID = "401912520";
const REFRESH_MS = 30_000;
// Ida no Maracanã: Fluminense 1 x 2 Palmeiras.
const FIRST_LEG = { home: 2, away: 1 };

type Side = { name: string; abbr: string; logo: string; score: number; id: string };
type Goal = { minute: string; player: string; teamId: string; note: string };
type Match = {
  home: Side;
  away: Side;
  state: "pre" | "in" | "post";
  clock: string;
  detail: string;
  goals: Goal[];
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function parse(json: any): Match | null {
  const event = json?.events?.find((e: any) => e.id === EVENT_ID);
  const comp = event?.competitions?.[0];
  if (!comp) return null;

  const side = (homeAway: string): Side => {
    const c = comp.competitors.find((t: any) => t.homeAway === homeAway);
    return {
      id: c.id,
      name: c.team.shortDisplayName ?? c.team.displayName,
      abbr: c.team.abbreviation,
      logo: c.team.logo,
      score: Number(c.score ?? 0),
    };
  };

  const goals: Goal[] = (comp.details ?? [])
    .filter((d: any) => d.scoringPlay)
    .map((d: any) => ({
      minute: d.clock?.displayValue ?? "",
      player: d.athletesInvolved?.[0]?.displayName ?? "Gol",
      teamId: d.team?.id ?? "",
      note: d.ownGoal ? "contra" : d.penaltyKick ? "pênalti" : "",
    }));

  const status = comp.status?.type ?? {};
  return {
    home: side("home"),
    away: side("away"),
    state: status.state ?? "pre",
    clock: comp.status?.displayClock ?? "",
    detail: status.detail ?? "",
    goals,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function statusLabel(m: Match) {
  if (m.state === "pre") return "Aguardando o apito";
  if (m.state === "post") return "Fim de jogo";
  if (/half/i.test(m.detail) && !/first|second/i.test(m.detail)) return "Intervalo";
  return `Ao vivo · ${m.clock}`;
}

export function Scoreboard() {
  const [match, setMatch] = useState<Match | null>(null);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(ENDPOINT, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const parsed = parse(await res.json());
        if (!alive) return;
        if (!parsed) throw new Error("jogo não encontrado");
        setMatch(parsed);
        setError(false);
        setUpdatedAt(new Date());
      } catch {
        if (alive) setError(true);
      }
    }
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!match) {
    return (
      <section className={styles.board} aria-busy={!error}>
        <p className={styles.loading}>{error ? "As trevas engoliram o placar. Tentando de novo…" : "Invocando o placar…"}</p>
      </section>
    );
  }

  const aggHome = FIRST_LEG.home + match.home.score;
  const aggAway = FIRST_LEG.away + match.away.score;
  const live = match.state === "in";

  return (
    <>
      <section className={styles.board} aria-live="polite">
        <p className={`${styles.status} ${live ? styles.live : ""}`}>{statusLabel(match)}</p>

        <div className={styles.teams}>
          <Team side={match.home} />
          <div className={styles.score}>
            <span>{match.home.score}</span>
            <span className={styles.cross}>✠</span>
            <span>{match.away.score}</span>
          </div>
          <Team side={match.away} />
        </div>

        <p className={styles.aggregate}>
          Agregado <strong>{match.home.abbr} {aggHome} × {aggAway} {match.away.abbr}</strong>
          <span className={styles.aggNote}>ida no Maracanã: Fluminense 1 × 2 Palmeiras</span>
        </p>
      </section>

      <section className={styles.chronicle}>
        <h2 className={styles.chronicleTitle}>Crônica dos Gols</h2>
        {match.goals.length === 0 ? (
          <p className={styles.empty}>Nenhuma alma balançou as redes ainda.</p>
        ) : (
          <ol className={styles.goals}>
            {match.goals.map((g, i) => (
              <li key={i}>
                <span className={styles.minute}>{g.minute}</span>
                <span className={styles.player}>
                  {g.player}
                  {g.note && <em> ({g.note})</em>}
                </span>
                <span className={styles.goalTeam}>
                  {g.teamId === match.home.id ? match.home.abbr : match.away.abbr}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      {updatedAt && (
        <p className={styles.updated}>
          {error ? "Falha na última consulta. " : ""}
          Atualizado às {updatedAt.toLocaleTimeString("pt-BR")}
        </p>
      )}
    </>
  );
}

function Team({ side }: { side: Side }) {
  return (
    <div className={styles.team}>
      <div className={styles.crest}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={side.logo} alt="" width={96} height={96} />
      </div>
      <span className={styles.teamName}>{side.name}</span>
    </div>
  );
}
