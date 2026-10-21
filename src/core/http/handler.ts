import "server-only";
import { ZodError } from "zod";
import { AppError, type ErrorBody } from "./errors";

export const NO_STORE = "no-store";
export const PUBLIC_POLLING_CACHE = "public, max-age=0, s-maxage=1, stale-while-revalidate=2";

export function json<T>(data: T, init: ResponseInit & { cache?: string } = {}): Response {
  const { cache = NO_STORE, headers, ...rest } = init;
  const h = new Headers(headers);
  h.set("Cache-Control", cache);
  return Response.json(data, { ...rest, headers: h });
}

function errorResponse(err: unknown): Response {
  if (err instanceof AppError) {
    return json<ErrorBody>(err.toBody(), { status: err.status });
  }
  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? "Dados inválidos";
    return json<ErrorBody>({ error: message, code: "VALIDATION" }, { status: 400 });
  }
  console.error("[mural] erro inesperado", err);
  return json<ErrorBody>({ error: "Erro interno", code: "INTERNAL" }, { status: 500 });
}

/** Envolve um route handler convertendo AppError/ZodError em JSON `{ error, code }`. */
export function route<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new AppError(400, "INVALID_JSON", "Corpo da requisição não é um JSON válido");
  }
}
