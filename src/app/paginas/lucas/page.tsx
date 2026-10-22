import type { Metadata } from "next";
import { Permanent_Marker, Rubik_Dirt } from "next/font/google";
import Link from "next/link";
import { Countdown, ShareButton } from "./client";
import styles from "./page.module.css";

const dirt = Rubik_Dirt({ subsets: ["latin"], weight: "400", variable: "--font-dirt" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker" });

export const metadata: Metadata = {
  title: "Lucas · TechWeek 2026",
  description: "Jesus na Praça: encontro de jovens no sábado, 31/10, às 19h00.",
};

// Horário de Brasília.
const EVENT_AT = "2026-10-31T19:00:00-03:00";

const highlights = [
  { tag: "01", title: "Som alto", text: "Louvor ao vivo no meio da praça. Chega e canta junto." },
  { tag: "02", title: "Papo reto", text: "Uma palavra direta, sem enrolação, pra quem quer ouvir." },
  { tag: "03", title: "Galera", text: "Traz os amigos. Ninguém fica de fora, a rua é de todo mundo." },
];

const tape = "Jesus na Praça ✦ 31/10 ✦ 19h00 ✦ Entrada livre ✦ Chama a galera ✦ ";

export default function LucasPage() {
  return (
    <div className={`${styles.root} ${dirt.variable} ${marker.variable}`}>
      <div className={styles.noise} aria-hidden />

      <nav className={styles.nav}>
        <Link href="/" className={styles.back}>
          ← Voltar
        </Link>
        <span className={styles.navTag}>Evento jovem</span>
      </nav>

      <header className={styles.hero}>
        <p className={styles.kicker}>Sábado · 31/10 · 19h00</p>
        <h1 className={styles.title}>
          <span>Jesus</span>
          <span className={styles.titleSmall}>na</span>
          <span className={styles.titleBlock}>Praça</span>
        </h1>
        <p className={styles.scrawl}>a rua vai ouvir.</p>
        <div className={styles.stamp} aria-hidden>
          31.10
          <small>19h</small>
        </div>
      </header>

      <div className={styles.tape} aria-hidden>
        <div className={styles.tapeTrack}>
          <span>{tape.repeat(4)}</span>
          <span>{tape.repeat(4)}</span>
        </div>
      </div>

      <main className={styles.main}>
        <section>
          <h2 className={styles.sectionLabel}>Falta pouco</h2>
          <Countdown target={EVENT_AT} />
        </section>

        <section className={styles.grid}>
          {highlights.map((h) => (
            <article key={h.tag} className={styles.card}>
              <span className={styles.cardTag}>{h.tag}</span>
              <h3 className={styles.cardTitle}>{h.title}</h3>
              <p>{h.text}</p>
            </article>
          ))}
        </section>

        <section className={styles.info}>
          <dl>
            <div>
              <dt>Quando</dt>
              <dd>Sábado, 31 de outubro</dd>
            </div>
            <div>
              <dt>Hora</dt>
              <dd>19h00</dd>
            </div>
            <div>
              <dt>Onde</dt>
              <dd>Na praça</dd>
            </div>
            <div>
              <dt>Quanto</dt>
              <dd>De graça</dd>
            </div>
          </dl>
        </section>

        <section className={styles.cta}>
          <p className={styles.ctaText}>
            Não vem sozinho.
            <br />
            <span>Chama a galera.</span>
          </p>
          <ShareButton className={styles.ctaButton} />
        </section>
      </main>

      <footer className={styles.footer}>Jesus na Praça · 31/10 · 19h00</footer>
    </div>
  );
}
