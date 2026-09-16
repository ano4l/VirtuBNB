import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AgentOrchestrator } from "../../src/agent/orchestrator.js";
import type { LlmClient } from "../../src/ai/llm-client.js";
import { MemoryStore } from "../../src/store/memory-store.js";

describe("agent orchestrator", () => {
  it("fails closed when no server-side model is configured", async () => {
    const result = await new AgentOrchestrator(new MemoryStore()).interpret("Block Rosebank tomorrow");
    assert.equal(result.source, "unavailable");
    assert.match(result.reply, /not configured/i);
    assert.equal(result.proposal, undefined);
  });

  it("validates Luna output before reporting an approval-bound plan", async () => {
    const client: LlmClient = {
      async propose() {
        return {
          action: "upsert_availability",
          propertyId: "prop_rosebank",
          entries: [{ date: "2026-10-01", status: "blocked" }],
        };
      },
    };
    const result = await new AgentOrchestrator(new MemoryStore(), client).interpret("Block Rosebank on 1 October");
    assert.equal(result.source, "gpt-5.6-luna");
    assert.equal(result.proposal?.action, "upsert_availability");
    assert.equal(result.policy?.requiresApproval, true);
    assert.match(result.reply, /no Airbnb action has been attempted/i);
  });

  it("does not accept malformed model output", async () => {
    const client: LlmClient = { async propose() { return { action: "send_money", amount: 10 }; } };
    const result = await new AgentOrchestrator(new MemoryStore(), client).interpret("Pay a guest");
    assert.equal(result.proposal, undefined);
    assert.match(result.reply, /safe, specific action/i);
  });
});
