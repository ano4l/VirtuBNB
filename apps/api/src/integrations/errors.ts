export type ProviderErrorCode =
  | "provider_unavailable"
  | "capability_unsupported"
  | "mapping_missing"
  | "provider_rejected"
  | "confirmation_pending"
  | "provider_state_mismatch";

export class ProviderError extends Error {
  constructor(
    readonly code: ProviderErrorCode,
    message: string,
    readonly retryable: boolean,
    readonly details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
