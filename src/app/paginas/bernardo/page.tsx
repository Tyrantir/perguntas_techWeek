import type { Metadata } from "next";
import { Cinzel, IM_Fell_English, UnifrakturMaguntia } from "next/font/google";
import Link from "next/link";
import { Scoreboard } from "./client";
import styles from "./page.module.css";

const fraktur = UnifrakturMaguntia({ subsets: ["latin"], weight: "400", variable: "--font-fraktur" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-cinzel" });
const fell = IM_Fell_English({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-fell" });

export const metadata: Metadata = {
  title: "Bernardo · TechWeek 2026",
  description: "Placar ao vivo de Palmeiras x Fluminense, semifinal da Libertadores, 21/10/2026.",
};

export default function BernardoPage() {
  return (
    <div className={`${styles.page} ${fraktur.variable} ${cinzel.variable} ${fell.variable}`}>
      <Link href="/" className={styles.back}>
        ← Voltar
      </Link>

      <header className={styles.header}>
        <p className={styles.kicker}>✠ Libertadores · Semifinal · Volta ✠</p>
        <h1 className={styles.title}>O Duelo</h1>
        <p className={styles.subtitle}>Allianz Parque · 21 de outubro de 2026 · 21h30</p>
      </header>

      <main className={styles.main}>
        <Scoreboard />
      </main>

      <footer className={styles.footer}>
        <span>✠</span> placar via ESPN, renovado a cada 30 segundos <span>✠</span>
      </footer>
    </div>
  );
}
