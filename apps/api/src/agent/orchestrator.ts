import type { LlmClient } from "../ai/llm-client.js";
import { safeParseProposal, type Proposal } from "../ai/proposal-schema.js";
import { evaluateActionPolicy, type PolicyDecision } from "../policy/action-policy.js";
import type { MemoryStore } from "../store/memory-store.js";

export type AgentCommandResult = {
  reply: string;
  source: "deterministic" | "gpt-5.6-luna" | "unavailable";
  proposal?: Proposal;
  policy?: PolicyDecision;
};

/**
 * This service is deliberately an interpreter, not an executor. It makes the
 * model useful from the web app and WhatsApp while preserving the policy and
 * browser-execution boundaries required for real Airbnb operations.
 */
export class AgentOrchestrator {
  constructor(private readonly store: MemoryStore, private readonly client?: LlmClient) {}

  async interpret(instruction: string): Promise<AgentCommandResult> {
    if (!this.client) {
      return {
        source: "unavailable",
        reply: "Virtu’s AI planner is not configured yet. Connect the server-side OpenAI key to use natural-language planning; no Airbnb action was attempted.",
      };
    }

    try {
      const raw = await this.client.propose({ instruction, context: this.context() });
      const parsed = safeParseProposal(raw);
      if (!parsed.success) {
        return { source: "gpt-5.6-luna", reply: "I could not turn that into a safe, specific action. Please name one property and the exact dates or change you want." };
      }
      const policy = evaluateActionPolicy(parsed.data);
      return {
        source: "gpt-5.6-luna",
        proposal: parsed.data,
        policy,
        reply: this.replyFor(parsed.data, policy),
      };
    } catch {
      return { source: "unavailable", reply: "Virtu could not reach the AI planner. Nothing was changed; try again shortly." };
    }
  }

  private context() {
    return {
      properties: this.store.properties.map(({ id, name, status, nextStay }) => ({ id, name, status, nextStay })),
      conversations: this.store.conversations.map(({ id, propertyId, guestName, bookingId }) => ({ id, propertyId, guestName, bookingId })),
      bookings: this.store.bookings.map(({ id, propertyId, guestName, checkIn, checkOut, status }) => ({ id, propertyId, guestName, checkIn, checkOut, status })),
      operatingBoundary: "VirtuHost may only create read or change proposals. Browser execution is a separate, approval-bound service.",
    };
  }

  private replyFor(proposal: Proposal, policy: PolicyDecision): string {
    if (proposal.action === "read") return "I have a read plan ready. Live Airbnb data will appear only after the authorized browser connection is healthy.";
    const property = this.store.properties.find((item) => item.id === proposal.propertyId);
    const target = property?.name ?? proposal.propertyId;
    return `${this.describe(proposal)} for ${target}. This is an approval-required proposal; no Airbnb action has been attempted.`;
  }

  private describe(proposal: Proposal): string {
    switch (proposal.action) {
      case "send_guest_message": return "I prepared a guest-message action";
      case "upsert_rates": return `I prepared ${proposal.entries.length} rate change${proposal.entries.length === 1 ? "" : "s"}`;
      case "upsert_availability": return `I prepared ${proposal.entries.length} calendar change${proposal.entries.length === 1 ? "" : "s"}`;
      case "upsert_listing_content": return "I prepared a listing-content change";
      case "modify_reservation": return "I prepared a reservation-change action";
      case "read": return "I prepared a read";
    }
  }
}
