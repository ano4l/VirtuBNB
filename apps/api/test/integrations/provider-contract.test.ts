import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FakeProviderAdapter } from "../../src/integrations/fake/fake-adapter.js";
import { ProviderError } from "../../src/integrations/errors.js";
import { ProviderRegistry } from "../../src/integrations/registry.js";

describe("provider-neutral integration contract", () => {
  it("registers and resolves a provider without controller branching", () => {
    const registry = new ProviderRegistry();
    const provider = new FakeProviderAdapter();
    registry.register(provider);
    assert.equal(registry.get("fake"), provider);
    assert.throws(() => registry.register(provider), /already registered/);
  });

  it("dispatches a canonical command and requires a provider result", async () => {
    const provider = new FakeProviderAdapter();
    const result = await provider.execute({
      kind: "send_guest_message",
      connectionId: "connection_1",
      conversationId: "conversation_1",
      body: "Your check-in instructions are ready.",
      proposalId: "proposal_1",
    });
    assert.equal(result.status, "confirmed");
    assert.equal(provider.commands.length, 1);
    assert.equal((await provider.reconcile({ connectionId: "connection_1", providerReference: result.providerReference })).status, "confirmed");
  });

  it("models retryable provider failure without duplicating the command", async () => {
    const provider = new FakeProviderAdapter();
    provider.failNext = true;
    await assert.rejects(
      provider.execute({
        kind: "upsert_availability",
        connectionId: "connection_1",
        propertyId: "property_1",
        entries: [{ date: "2026-10-01", available: false }],
        proposalId: "proposal_1",
      }),
      (error: unknown) => error instanceof ProviderError && error.retryable,
    );
    assert.equal(provider.commands.length, 0);
  });

  it("keeps unknown provider references pending", async () => {
    const provider = new FakeProviderAdapter();
    assert.equal((await provider.reconcile({ connectionId: "connection_1", providerReference: "missing" })).status, "pending");
  });
});
