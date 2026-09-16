import type { Proposal } from "./proposal-schema.js";

export type LlmProposalRequest = {
  instruction: string;
  context?: Readonly<Record<string, unknown>>;
};

/**
 * Provider-neutral boundary for a model that proposes an operation.
 * Implementations must return untrusted data; callers must validate it with
 * parseProposal before policy evaluation or execution.
 */
export interface LlmClient {
  propose(request: LlmProposalRequest): Promise<unknown>;
}

export type ValidatedLlmProposal = {
  proposal: Proposal;
  raw: unknown;
};
