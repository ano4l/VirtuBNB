import type { BookingChannel, ProviderName } from "../domain/types.js";
import type { CapabilitySnapshot } from "./capabilities.js";

export type ReservationQuery = {
  connectionId: string;
  modifiedSince?: string;
  cursor?: string;
};

export type ProviderReservation = {
  externalReservationId: string;
  externalPropertyId: string;
  channel: BookingChannel;
  status: "inquiry" | "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
  checkIn: string;
  checkOut: string;
  guestCount: number;
  currency: string;
  totalAmount?: number;
  providerRevisionId: string;
};

export type ProviderMessage = {
  externalMessageId: string;
  externalConversationId: string;
  externalReservationId?: string;
  channel: BookingChannel;
  direction: "guest" | "property";
  body: string;
  occurredAt: string;
};

export type ProviderCommand =
  | { kind: "send_guest_message"; connectionId: string; conversationId: string; body: string; proposalId: string }
  | { kind: "upsert_rates"; connectionId: string; propertyId: string; entries: ReadonlyArray<{ date: string; amount: number; currency: string }>; proposalId: string }
  | { kind: "upsert_availability"; connectionId: string; propertyId: string; entries: ReadonlyArray<{ date: string; available: boolean }>; proposalId: string }
  | { kind: "upsert_listing_content"; connectionId: string; listingId: string; patch: Readonly<Record<string, unknown>>; proposalId: string }
  | { kind: "modify_reservation"; connectionId: string; reservationId: string; patch: Readonly<Record<string, unknown>>; proposalId: string };

export type DispatchResult = {
  status: "accepted" | "confirmed" | "rejected";
  providerReference: string;
  acceptedAt: string;
  confirmedAt?: string;
  details?: Readonly<Record<string, unknown>>;
};

export type ProviderState = {
  status: "pending" | "confirmed" | "rejected" | "mismatch";
  checkedAt: string;
  details?: Readonly<Record<string, unknown>>;
};

export interface PropertyProvider {
  readonly name: ProviderName;
  getCapabilities(connectionId: string): Promise<CapabilitySnapshot>;
  listReservations(query: ReservationQuery): Promise<{ data: ProviderReservation[]; nextCursor?: string }>;
  listMessages(query: { connectionId: string; modifiedSince?: string; cursor?: string }): Promise<{ data: ProviderMessage[]; nextCursor?: string }>;
  execute(command: ProviderCommand): Promise<DispatchResult>;
  reconcile(reference: { connectionId: string; providerReference: string }): Promise<ProviderState>;
}
