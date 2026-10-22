import type { Metadata } from "next";
import { Newspaper } from "./newspaper";

export const metadata: Metadata = {
  title: "Akira · TechWeek 2026",
  description: "As perguntas do mural em formato de jornal, com espaço para anotar as respostas.",
};

export default function AkiraPage() {
  return <Newspaper />;
}
