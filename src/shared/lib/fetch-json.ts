export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchJsonInit = Omit<RequestInit, "body"> & { json?: unknown };

/** fetch que serializa `json`, lança ApiError com `{ error, code }` da API e devolve o corpo tipado. */
export async function fetchJson<T>(url: string, init: FetchJsonInit = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const h = new Headers(headers);
  h.set("Accept", "application/json");
  if (json !== undefined) h.set("Content-Type", "application/json");

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: h,
      body: json === undefined ? undefined : JSON.stringify(json),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "Sem conexão com o servidor");
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (body ?? {}) as { error?: unknown; code?: unknown };
    throw new ApiError(
      res.status,
      typeof err.code === "string" ? err.code : "HTTP_ERROR",
      typeof err.error === "string" ? err.error : `Erro ${res.status}`,
    );
  }
  return body as T;
}
