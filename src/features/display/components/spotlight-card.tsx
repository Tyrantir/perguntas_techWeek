import type { Question } from "@/features/questions/domain/types";

export function SpotlightCard({ question }: { question: Question }) {
  return (
    <section className="rounded-[2.5vh] border-2 border-accent bg-accent/10 px-[3.5vh] py-[3vh]">
      <p className="text-[2.2vh] font-semibold tracking-[0.2em] text-accent uppercase">Respondendo agora</p>
      <p className="mt-[1.5vh] line-clamp-3 text-[4.2vh] leading-tight font-semibold break-words">{question.text}</p>
      <p className="mt-[1.5vh] text-[2.4vh] text-muted">
        {question.author ?? "Anônimo"} · {question.votes} {question.votes === 1 ? "voto" : "votos"}
      </p>
    </section>
  );
}
