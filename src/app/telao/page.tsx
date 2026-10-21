import type { Metadata } from "next";
import { DisplayScreen } from "@/features/display/components/display-screen";

export const metadata: Metadata = { title: "Telão · Mural de perguntas" };

export default function TelaoPage() {
  return <DisplayScreen />;
}
