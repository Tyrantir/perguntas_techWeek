"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useBoard } from "@/features/questions/client/hooks";
import type { Question } from "@/features/questions/domain/types";
import styles from "./page.module.css";

// Anotações ficam só no navegador de quem escreve.
const NOTES_KEY = "akira:notes";

type Notes = Record<string, string>;

function readNotes(): Notes {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "{}") as Notes;
  } catch {
    return {};
  }
}

function writeNotes(notes: Notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    // Armazenamento bloqueado: as notas valem só enquanto a aba estiver aberta.
  }
}

const dateFormat = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

export function Newspaper() {
  const board = useBoard();
  const [notes, setNotes] = useState<Notes>({});
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setNotes(readNotes());
    setToday(dateFormat.format(new Date()));
  }, []);

  function updateNote(id: string, text: string) {
    setNotes((current) => {
      const next = { ...current, [id]: text };
      if (!text) delete next[id];
      writeNotes(next);
      return next;
    });
  }

  const questions = board.data?.questions ?? [];
  const [lead, ...rest] = questions;
  const answered = questions.filter((q) => q.status === "answered").length;

  return (
    <div className={styles.paper}>
      <div className={styles.sheet}>
        <nav className={styles.topbar}>
          <Link href="/">← Voltar à capa</Link>
          <span>Edição TechWeek 2026</span>
        </nav>

        <header className={styles.masthead}>
          <p className={styles.motto}>“Nenhuma pergunta fica sem registro”</p>
          <h1 className={styles.title}>O Diário das Perguntas</h1>
          <div className={styles.dateline}>
            <span>Ano I · Nº 26</span>
            <span className={styles.today}>{today ?? " "}</span>
            <span>
              {questions.length} {questions.length === 1 ? "pergunta" : "perguntas"} · {answered}{" "}
              {answered === 1 ? "respondida" : "respondidas"}
            </span>
          </div>
        </header>

        {board.error && !board.data ? (
          <p className={styles.notice}>Rotativas paradas: não foi possível buscar as perguntas. Tentando de novo…</p>
        ) : !board.data ? (
          <p className={styles.notice}>Imprimindo a edição…</p>
        ) : !lead ? (
          <p className={styles.notice}>
            Edição em branco. Nenhuma pergunta foi feita ainda; mande a primeira no <Link href="/mural">mural</Link>.
          </p>
        ) : (
          <main>
            <Article question={lead} note={notes[lead.id] ?? ""} onNote={updateNote} lead />
            {rest.length > 0 && (
              <div className={styles.columns}>
                {rest.map((q) => (
                  <Article key={q.id} question={q} note={notes[q.id] ?? ""} onNote={updateNote} />
                ))}
              </div>
            )}
          </main>
        )}

        <footer className={styles.footer}>
          Impresso nas oficinas da TechWeek 2026 · As anotações ficam salvas apenas neste aparelho
        </footer>
      </div>
    </div>
  );
}

type ArticleProps = {
  question: Question;
  note: string;
  onNote: (id: string, text: string) => void;
  lead?: boolean;
};

function Article({ question, note, onNote, lead = false }: ArticleProps) {
  const noteId = `nota-${question.id}`;

  return (
    <article className={lead ? styles.lead : styles.article}>
      <p className={styles.section}>
        {lead ? "Manchete" : "Pergunta"}
        {question.status === "answered" && <span className={styles.stamp}>Respondida</span>}
      </p>
      <h2 className={lead ? styles.leadHeadline : styles.headline}>{question.text}</h2>
      <p className={styles.byline}>
        Por {question.author ?? "leitor anônimo"} · {timeFormat.format(question.createdAt)} ·{" "}
        {question.votes} {question.votes === 1 ? "voto" : "votos"}
      </p>
      <label htmlFor={noteId} className={styles.noteLabel}>
        Resposta
      </label>
      <textarea
        id={noteId}
        className={styles.note}
        rows={lead ? 6 : 4}
        value={note}
        onChange={(e) => onNote(question.id, e.target.value)}
        placeholder="Escreva aqui…"
      />
    </article>
  );
}
