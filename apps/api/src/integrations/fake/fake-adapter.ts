import { randomUUID } from "node:crypto";
import { fakeProviderCapabilities } from "../capabilities.js";
import type { DispatchResult, PropertyProvider, ProviderCommand, ProviderMessage, ProviderReservation, ProviderState } from "../contracts.js";
import { ProviderError } from "../errors.js";

export class FakeProviderAdapter implements PropertyProvider {
  readonly name = "fake" as const;
  readonly reservations: ProviderReservation[] = [];
  readonly messages: ProviderMessage[] = [];
  readonly commands: ProviderCommand[] = [];
  readonly results = new Map<string, ProviderState>();
  failNext = false;

  async getCapabilities(_connectionId: string) {
    return fakeProviderCapabilities;
  }

  async listReservations(_query: { connectionId: string }) {
    return { data: [...this.reservations] };
  }

  async listMessages(_query: { connectionId: string }) {
    return { data: [...this.messages] };
  }

  async execute(command: ProviderCommand): Promise<DispatchResult> {
    if (this.failNext) {
      this.failNext = false;
      throw new ProviderError("provider_unavailable", "Synthetic provider failure", true);
    }
    this.commands.push(command);
    const providerReference = `fake_${randomUUID()}`;
    const confirmedAt = new Date().toISOString();
    this.results.set(providerReference, { status: "confirmed", checkedAt: confirmedAt });
    return { status: "confirmed", providerReference, acceptedAt: confirmedAt, confirmedAt };
  }

  async reconcile(reference: { connectionId: string; providerReference: string }): Promise<ProviderState> {
    return this.results.get(reference.providerReference) ?? {
      status: "pending",
      checkedAt: new Date().toISOString(),
    };
  }
}
