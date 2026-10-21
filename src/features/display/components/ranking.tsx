import type { Question } from "@/features/questions/domain/types";
import { cn } from "@/shared/lib/cn";

type Props = {
  questions: Question[];
  /** Quantidade de linhas reservadas: a altura é dividida igualmente para nunca cortar uma linha no meio. */
  slots: number;
  /** Com o card de destaque visível sobra menos altura; o texto passa a ocupar uma linha só. */
  compact: boolean;
};

export function Ranking({ questions, slots, compact }: Props) {
  if (questions.length === 0) {
    return (
      <p className="flex flex-1 items-center justify-center rounded-[2.5vh] border-2 border-dashed border-border text-[3vh] text-muted">
        Escaneie o QR code e mande a primeira pergunta
      </p>
    );
  }

  return (
    <ol
      className="grid h-full gap-[1.2vh]"
      style={{ gridTemplateRows: `repeat(${slots}, minmax(0, 1fr))` }}
    >
      {questions.slice(0, slots).map((q, i) => (
        <li
          key={q.id}
          className="flex min-h-0 items-center gap-[2.5vh] overflow-hidden rounded-[2vh] border border-border bg-surface px-[2.5vh]"
        >
          <span className="w-[4vh] shrink-0 text-center text-[2.8vh] font-semibold text-muted tabular-nums">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "leading-snug break-words",
                compact ? "line-clamp-1 text-[2.5vh]" : "line-clamp-2 text-[2.7vh]",
              )}
            >
              {q.text}
            </p>
            {!compact && <p className="mt-[0.3vh] text-[1.8vh] text-muted">{q.author ?? "Anônimo"}</p>}
          </div>
          <span className="flex shrink-0 items-baseline gap-[0.6vh] rounded-[1.2vh] bg-accent/15 px-[1.6vh] py-[0.6vh] text-accent">
            <span className="text-[2.9vh] leading-none font-bold tabular-nums">{q.votes}</span>
            <span className="text-[1.5vh] tracking-wide uppercase">{q.votes === 1 ? "voto" : "votos"}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
