import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseProposal, proposalSchema, safeParseProposal } from "../../src/ai/proposal-schema.js";
import type { LlmClient } from "../../src/ai/llm-client.js";
import { evaluateActionPolicy } from "../../src/policy/action-policy.js";

describe("AI proposal contracts", () => {
  it("accepts the allowlisted read operation", () => {
    const result = safeParseProposal({ action: "read", operation: "availability", propertyId: "prop_rosebank" });
    assert.equal(result.success, true);
  });

  it("accepts guest messaging, rates, availability, listing, and reservation proposals", () => {
    const proposals = [
      { action: "send_guest_message", propertyId: "prop_1", conversationId: "conv_1", body: "Your check-in details are ready." },
      { action: "upsert_rates", propertyId: "prop_1", entries: [{ date: "2026-09-20", nightlyRate: 1500, currency: "ZAR" }] },
      { action: "upsert_availability", propertyId: "prop_1", entries: [{ date: "2026-09-20", status: "blocked" }] },
      { action: "upsert_listing_content", propertyId: "prop_1", patch: { description: "A bright city apartment." } },
      { action: "modify_reservation", propertyId: "prop_1", reservationId: "res_1", patch: { guests: 3 } },
    ];

    for (const proposal of proposals) assert.equal(proposalSchema.safeParse(proposal).success, true);
  });

  it("rejects unknown actions and unexpected fields", () => {
    assert.equal(safeParseProposal({ action: "delete_property", propertyId: "prop_1" }).success, false);
    assert.equal(safeParseProposal({ action: "read", operation: "dashboard", execute: true }).success, false);
    assert.throws(() => parseProposal({ action: "upsert_rates", propertyId: "prop_1", entries: [] }));
  });

  it("rejects malformed consequential payloads", () => {
    assert.equal(safeParseProposal({
      action: "send_guest_message",
      propertyId: "prop_1",
      conversationId: "conv_1",
      body: "",
    }).success, false);
    assert.equal(safeParseProposal({
      action: "modify_reservation",
      propertyId: "prop_1",
      reservationId: "res_1",
      patch: { checkIn: "2026-09-22", checkOut: "2026-09-20" },
    }).success, false);
    assert.equal(safeParseProposal({
      action: "upsert_listing_content",
      propertyId: "prop_1",
      patch: {},
    }).success, false);
  });

  it("keeps the model boundary provider-neutral", async () => {
    const client: LlmClient = {
      async propose() {
        return { action: "read", operation: "dashboard" };
      },
    };
    const result = await client.propose({ instruction: "Summarise today" });
    assert.equal(safeParseProposal(result).success, true);
  });
});

describe("deterministic action policy", () => {
  it("allows valid reads without approval", () => {
    const decision = evaluateActionPolicy({ action: "read", operation: "dashboard" });
    assert.deepEqual(decision, {
      action: "read",
      decision: "allow",
      risk: "low",
      requiresApproval: false,
      reason: "Read-only operations do not change provider or reservation state.",
    });
  });

  it("requires approval for every consequential action", () => {
    const proposals = [
      { action: "send_guest_message", propertyId: "prop_1", conversationId: "conv_1", body: "We can offer early check-in." },
      { action: "upsert_rates", propertyId: "prop_1", entries: [{ date: "2026-09-20", nightlyRate: 1500, currency: "ZAR" }] },
      { action: "upsert_availability", propertyId: "prop_1", entries: [{ date: "2026-09-20", status: "blocked" }] },
      { action: "upsert_listing_content", propertyId: "prop_1", patch: { title: "New title" } },
      { action: "modify_reservation", propertyId: "prop_1", reservationId: "res_1", patch: { status: "cancelled" } },
    ];

    for (const proposal of proposals) {
      const decision = evaluateActionPolicy(proposal);
      assert.equal(decision.decision, "require_approval");
      assert.equal(decision.requiresApproval, true);
    }
  });

  it("denies malformed and unknown proposals before policy execution", () => {
    const malformed = evaluateActionPolicy({ action: "upsert_rates", propertyId: "prop_1", entries: [] });
    assert.equal(malformed.decision, "deny");
    assert.equal(malformed.requiresApproval, false);
    assert.ok(malformed.issues && malformed.issues.length > 0);

    const unknown = evaluateActionPolicy({ action: "refund_guest", reservationId: "res_1" });
    assert.equal(unknown.action, "refund_guest");
    assert.equal(unknown.decision, "deny");
    assert.equal(unknown.risk, "high");
  });
});
