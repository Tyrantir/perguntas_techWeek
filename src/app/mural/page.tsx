import type { Metadata } from "next";
import { ParticipantScreen } from "@/features/questions/components/participant-screen";

export const metadata: Metadata = { title: "Mural de perguntas · TechWeek 2026" };

export default function MuralPage() {
  return <ParticipantScreen />;
}
