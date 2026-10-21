"use client";

import { useAdminPin } from "../client/hooks";
import { AdminPanel } from "./admin-panel";
import { PinGate } from "./pin-gate";

export function AdminScreen() {
  const { pin, save, clear } = useAdminPin();
  if (pin === undefined) return null;
  return pin ? <AdminPanel pin={pin} onLogout={clear} /> : <PinGate onUnlock={save} />;
}
