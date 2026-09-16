export const providerCapabilityNames = [
  "portfolio_import",
  "reservations_read",
  "guest_messages_read",
  "guest_messages_send",
  "rates_write",
  "availability_write",
  "listing_content_write",
  "reservation_modify",
  "reviews_read",
  "reviews_reply",
] as const;

export type ProviderCapabilityName = (typeof providerCapabilityNames)[number];
export type ProviderCapabilityState = "supported" | "approval_required" | "draft_only" | "unsupported" | "unknown";
export type CapabilitySnapshot = Readonly<Record<ProviderCapabilityName, ProviderCapabilityState>> & {
  checkedAt: string;
};

export const fakeProviderCapabilities: CapabilitySnapshot = {
  portfolio_import: "supported",
  reservations_read: "supported",
  guest_messages_read: "supported",
  guest_messages_send: "approval_required",
  rates_write: "approval_required",
  availability_write: "approval_required",
  listing_content_write: "approval_required",
  reservation_modify: "approval_required",
  reviews_read: "supported",
  reviews_reply: "approval_required",
  checkedAt: "2026-01-01T00:00:00.000Z",
};
