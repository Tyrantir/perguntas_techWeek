export type ErrorCode =
  | "VALIDATION"
  | "INVALID_JSON"
  | "UNAUTHORIZED"
  | "ADMIN_DISABLED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "LIMIT_REACHED"
  | "INTERNAL";

export type ErrorBody = { error: string; code: ErrorCode };

export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }

  toBody(): ErrorBody {
    return { error: this.message, code: this.code };
  }
}
