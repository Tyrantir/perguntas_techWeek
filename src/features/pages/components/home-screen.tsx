import Link from "next/link";
import { pageHref, pages } from "../registry";

export function HomeScreen() {
  const entries = [...pages].reverse();

  return (
    <div className="bg-brand-glow min-h-dvh">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <header className="flex flex-col gap-2">
          <span className="font-display text-lg tracking-wide uppercase">
            Tech<span className="text-accent">Week</span> <span className="text-muted">26</span>
          </span>
          <h1 className="font-display text-[clamp(2.25rem,11vw,3.5rem)] leading-[1.02] tracking-tight uppercase">
            Páginas da <span className="text-accent">oficina</span>
          </h1>
          <p className="text-[15px] leading-relaxed text-muted">
            Cada prompt vira uma página nova, com o nome de quem pediu e um estilo só dela.
          </p>
        </header>

        <Link
          href="/mural"
          className="bg-brand-gradient flex items-center justify-between gap-4 rounded-2xl p-5 transition-opacity hover:opacity-90"
        >
          <span className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase opacity-80">Ao vivo</span>
            <span className="font-display text-2xl tracking-wide uppercase">Mural de perguntas</span>
          </span>
          <span aria-hidden className="text-2xl">→</span>
        </Link>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xs tracking-[0.2em] text-accent uppercase">
            {entries.length} {entries.length === 1 ? "página" : "páginas"}
          </h2>

          {entries.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted">
              Nenhuma página ainda. A primeira aparece aqui.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {entries.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={pageHref(page.slug)}
                    className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-[var(--accent)]"
                    style={{ "--accent": page.accent } as React.CSSProperties}
                  >
                    <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.15em] text-muted uppercase">
                      <span className="size-2 rounded-full bg-[var(--accent)]" />
                      {page.author}
                    </span>
                    <span className="font-display text-xl tracking-wide uppercase group-hover:text-[var(--accent)]">
                      {page.title}
                    </span>
                    <span className="text-sm leading-relaxed text-muted">{page.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
