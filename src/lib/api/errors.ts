const CODE_PREFIX = "urn:insyunik:error:";

/** An RFC 9457 problem returned by InSyunik-Api. Switch on `code`, never on `status` alone. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly type: string,
    readonly title: string,
    readonly detail?: string,
    readonly errors: Record<string, string[]> = {},
  ) {
    super(`${status} ${type}: ${title}`);
    this.name = "ApiError";
  }

  /** `property.not-found` for `urn:insyunik:error:property.not-found`; the raw type otherwise. */
  get code(): string {
    return this.type.startsWith(CODE_PREFIX) ? this.type.slice(CODE_PREFIX.length) : this.type;
  }
}

export function toApiError(status: number, body: unknown): ApiError {
  const problem = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const errors =
    typeof problem.errors === "object" && problem.errors !== null
      ? (problem.errors as Record<string, string[]>)
      : {};
  return new ApiError(
    status,
    typeof problem.type === "string" ? problem.type : "about:blank",
    typeof problem.title === "string" ? problem.title : `HTTP ${status}`,
    typeof problem.detail === "string" ? problem.detail : undefined,
    errors,
  );
}
