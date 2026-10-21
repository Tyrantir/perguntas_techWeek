import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "@/core/config/env";
import { AppError } from "@/core/http/errors";

export const ADMIN_PIN_HEADER = "x-admin-pin";

// timingSafeEqual exige buffers do mesmo tamanho; comparar hashes evita vazar o tamanho do PIN.
function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function assertAdmin(req: Request): void {
  const expected = env().adminPin;
  if (!expected) {
    throw new AppError(503, "ADMIN_DISABLED", "Painel admin desativado: defina ADMIN_PIN");
  }
  const provided = req.headers.get(ADMIN_PIN_HEADER) ?? "";
  if (!provided || !timingSafeEqual(digest(provided), digest(expected))) {
    throw new AppError(401, "UNAUTHORIZED", "PIN inválido");
  }
}
