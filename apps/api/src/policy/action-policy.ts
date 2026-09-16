import { safeParseProposal, type Proposal } from "../ai/proposal-schema.js";

export type ActionRisk = "low" | "medium" | "high" | "critical";
export type PolicyDecisionKind = "allow" | "require_approval" | "deny";

export type PolicyDecision = {
  action: string;
  decision: PolicyDecisionKind;
  risk: ActionRisk;
  requiresApproval: boolean;
  reason: string;
  issues?: readonly string[];
};

export const actionRiskPolicy: Readonly<Record<Proposal["action"], ActionRisk>> = {
  read: "low",
  send_guest_message: "medium",
  upsert_rates: "high",
  upsert_availability: "high",
  upsert_listing_content: "high",
  modify_reservation: "critical",
};

const actionLabel = (input: unknown): string => {
  if (typeof input === "object" && input !== null && "action" in input) {
    const action = (input as { action?: unknown }).action;
    if (typeof action === "string" && action.length > 0) return action;
  }
  return "unknown";
};

export function evaluateActionPolicy(input: unknown): PolicyDecision {
  const parsed = safeParseProposal(input);
  if (!parsed.success) {
    return {
      action: actionLabel(input),
      decision: "deny",
      risk: "high",
      requiresApproval: false,
      reason: "The proposal is malformed or uses an unsupported action.",
      issues: parsed.error.issues.map((issue) => `${issue.path.join(".") || "proposal"}: ${issue.message}`),
    };
  }

  return decisionForProposal(parsed.data);
}

export function decisionForProposal(proposal: Proposal): PolicyDecision {
  const risk = actionRiskPolicy[proposal.action];
  if (proposal.action === "read") {
    return {
      action: proposal.action,
      decision: "allow",
      risk,
      requiresApproval: false,
      reason: "Read-only operations do not change provider or reservation state.",
    };
  }

  return {
    action: proposal.action,
    decision: "require_approval",
    risk,
    requiresApproval: true,
    reason: "This operation can change guest-facing, availability, pricing, listing, or reservation state and requires explicit approval.",
  };
}

export const decideActionPolicy = evaluateActionPolicy;
