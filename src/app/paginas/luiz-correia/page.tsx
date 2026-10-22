import type { Metadata } from "next";
import { Black_Ops_One, Chakra_Petch } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./page.module.css";

const ops = Black_Ops_One({ subsets: ["latin"], weight: "400", variable: "--font-ops" });
const chakra = Chakra_Petch({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-chakra" });

export const metadata: Metadata = {
  title: "Luiz Correia · TechWeek 2026",
  description: "Hall da Fama do Counter-Strike brasileiro: os momentos que colocaram o Brasil no topo do servidor.",
};

/* Ilustrações em SVG, uma por momento. */
const art: Record<string, ReactNode> = {
  cpl: (
    <svg viewBox="0 0 200 120" aria-hidden>
      <path d="M70 20h60v18c0 22-14 36-30 36S70 60 70 38z" className={styles.fillGold} />
      <path d="M70 28H52c0 16 10 24 22 26M130 28h18c0 16-10 24-22 26" className={styles.strokeGold} />
      <rect x="92" y="74" width="16" height="14" className={styles.fillGold} />
      <rect x="76" y="88" width="48" height="10" className={styles.fillGold} />
      <text x="100" y="50" className={styles.svgText}>
        2006
      </text>
      <path d="M20 108h160" className={styles.strokeGreen} />
    </svg>
  ),
  major1: (
    <svg viewBox="0 0 200 120" aria-hidden>
      <circle cx="100" cy="58" r="40" className={styles.strokeGold} />
      <circle cx="100" cy="58" r="30" className={styles.strokeGreen} />
      <path d="M100 30l8 18 20 2-15 13 5 19-18-10-18 10 5-19-15-13 20-2z" className={styles.fillGold} />
      <text x="100" y="114" className={styles.svgTextSmall}>
        MAJOR #1
      </text>
    </svg>
  ),
  jump: (
    <svg viewBox="0 0 200 120" aria-hidden>
      <circle cx="100" cy="60" r="44" className={styles.strokeGreen} />
      <path d="M100 10v100M50 60h100" className={styles.strokeGreen} />
      <circle cx="100" cy="60" r="3" className={styles.fillRed} />
      <path d="M100 96c-10-14-10-28 0-40" className={styles.strokeGold} strokeDasharray="4 4" />
      <text x="168" y="34" className={styles.svgTextSmall}>
        ×2
      </text>
    </svg>
  ),
  major2: (
    <svg viewBox="0 0 200 120" aria-hidden>
      <circle cx="78" cy="58" r="34" className={styles.strokeGold} />
      <circle cx="122" cy="58" r="34" className={styles.strokeGreen} />
      <text x="78" y="66" className={styles.svgText}>
        1
      </text>
      <text x="122" y="66" className={styles.svgText}>
        2
      </text>
      <text x="100" y="114" className={styles.svgTextSmall}>
        BACK-TO-BACK
      </text>
    </svg>
  ),
  mvp: (
    <svg viewBox="0 0 200 120" aria-hidden>
      <rect x="40" y="70" width="34" height="34" className={styles.strokeGreen} />
      <rect x="83" y="30" width="34" height="74" className={styles.fillGold} />
      <rect x="126" y="54" width="34" height="50" className={styles.strokeGreen} />
      <text x="100" y="24" className={styles.svgTextSmall}>
        #1 · #1
      </text>
    </svg>
  ),
  rio: (
    <svg viewBox="0 0 200 120" aria-hidden>
      {Array.from({ length: 24 }, (_, i) => (
        <circle
          key={i}
          cx={16 + (i % 12) * 15.5}
          cy={i < 12 ? 92 : 106}
          r="6"
          className={i % 3 === 0 ? styles.fillGold : styles.fillGreen}
        />
      ))}
      <path d="M100 14l14 22h-28z" className={styles.fillGold} />
      <rect x="96" y="36" width="8" height="40" className={styles.fillGold} />
      <text x="150" y="40" className={styles.svgTextSmall}>
        RIO
      </text>
    </svg>
  ),
};

const moments = [
  {
    id: "cpl",
    year: "2006",
    title: "MIBR campeã da CPL Winter",
    text: "Em Dallas, a Made in Brazil derruba a elite mundial e leva um dos torneios mais pesados da era 1.6.",
  },
  {
    id: "major1",
    year: "Abr 2016",
    title: "Primeiro Major: MLG Columbus",
    text: "A Luminosity de FalleN, fer, coldzera, TACO e fnx vira a primeira equipe brasileira campeã de Major.",
  },
  {
    id: "jump",
    year: "2016",
    title: "O jumping double do coldzera",
    text: "Pulo, AWP e dois abates no ar contra a Liquid em Columbus. Até hoje uma das jogadas mais famosas do CS.",
  },
  {
    id: "major2",
    year: "Jul 2016",
    title: "Bicampeões em Colônia",
    text: "Agora como SK Gaming, o mesmo time vence a ESL One Cologne e emenda dois Majors seguidos.",
  },
  {
    id: "mvp",
    year: "2016 · 2017",
    title: "coldzera, melhor do mundo 2×",
    text: "Dois anos seguidos no topo do ranking de melhores jogadores da HLTV. Brasil no #1 individual.",
  },
  {
    id: "rio",
    year: "Nov 2022",
    title: "IEM Rio Major",
    text: "O primeiro Major em solo brasileiro. Arena lotada, FURIA nas semis e a torcida mais barulhenta do circuito.",
  },
];

const killfeed = [
  ["FalleN", "AWP", "s1mple"],
  ["coldzera", "AWP", "EliGE"],
  ["fer", "AK-47", "olofmeister"],
  ["TACO", "M4A1-S", "kennyS"],
  ["fnx", "DEAGLE", "GuardiaN"],
  ["KSCERATO", "AK-47", "ropz"],
];

const stats = [
  { value: "2", label: "Majors" },
  { value: "2×", label: "#1 HLTV" },
  { value: "1º", label: "Major no BR" },
  { value: "∞", label: "Torcida" },
];

export default function LuizCorreiaPage() {
  return (
    <div className={`${styles.root} ${ops.variable} ${chakra.variable}`}>
      <div className={styles.scanlines} aria-hidden />
      <div className={styles.grid} aria-hidden />

      <nav className={styles.nav}>
        <Link href="/" className={styles.back}>
          ← Voltar
        </Link>
        <span className={styles.ping}>
          <i /> 24ms · BR-SP
        </span>
      </nav>

      <header className={styles.hero}>
        <p className={styles.kicker}>&gt; connect hall-da-fama.br</p>
        <h1 className={styles.title} data-text="BRASIL NO SERVIDOR">
          BRASIL NO SERVIDOR
        </h1>
        <p className={styles.sub}>
          Do LAN house ao topo do mundo. Os momentos que fizeram o Counter-Strike falar português.
        </p>
        <div className={styles.reticle} aria-hidden>
          <span />
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.stats}>
          {stats.map((s) => (
            <div key={s.label} className={styles.stat}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </section>

        <section className={styles.feed} aria-label="Killfeed">
          {killfeed.map(([a, w, v], i) => (
            <div key={a} className={styles.feedRow} style={{ animationDelay: `${i * 0.35}s` }}>
              <b>{a}</b>
              <em>{w}</em>
              <span>{v}</span>
            </div>
          ))}
        </section>

        <p className={styles.scroll}>▼ desce pro Hall da Fama ▼</p>
      </main>

      <footer className={styles.footer}>
        <h2 className={styles.footerTitle}>
          <span>//</span> Hall da Fama
        </h2>

        <ol className={styles.moments}>
          {moments.map((m, i) => (
            <li key={m.id} className={styles.moment}>
              <div className={styles.frame}>
                {art[m.id]}
                <span className={styles.frameTag}>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className={styles.year}>{m.year}</p>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </li>
          ))}
        </ol>

        <div className={styles.credit}>
          <span>GG WP</span>
          <p>
            Prompt desta página feito por <strong>Luiz Correia</strong>
          </p>
        </div>
      </footer>
    </div>
  );
}
