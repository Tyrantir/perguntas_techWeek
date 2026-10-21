import type { Metadata } from "next";
import { AdminScreen } from "@/features/admin/components/admin-screen";

export const metadata: Metadata = {
  title: "Moderação · Mural de perguntas",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminScreen />;
}
