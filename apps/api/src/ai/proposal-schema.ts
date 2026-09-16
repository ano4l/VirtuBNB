import { z } from "zod";

const identifier = z.string().trim().min(1).max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return date.toISOString().slice(0, 10) === value;
}, "Expected a valid calendar date");
const currency = z.string().regex(/^[A-Z]{3}$/);

const readOperations = ["dashboard", "reservations", "availability", "property", "tasks", "messages"] as const;

export const readProposalSchema = z.object({
  action: z.literal("read"),
  operation: z.enum(readOperations),
  propertyId: identifier.optional(),
  reservationId: identifier.optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  limit: z.number().int().min(1).max(100).optional(),
}).strict().superRefine((proposal, context) => {
  if (["availability", "property", "messages"].includes(proposal.operation) && !proposal.propertyId) {
    context.addIssue({ code: "custom", path: ["propertyId"], message: "propertyId is required for this read operation" });
  }
  if (proposal.operation === "reservations" && !proposal.propertyId && !proposal.reservationId && !proposal.from && !proposal.to) {
    return;
  }
  if (proposal.from && proposal.to && proposal.from > proposal.to) {
    context.addIssue({ code: "custom", path: ["to"], message: "to must be on or after from" });
  }
});

const guestMessageProposal = z.object({
  action: z.literal("send_guest_message"),
  propertyId: identifier,
  conversationId: identifier,
  bookingId: identifier.optional(),
  body: z.string().trim().min(1).max(4096),
}).strict();

const rateEntrySchema = z.object({
  date: isoDate,
  nightlyRate: z.number().finite().positive().max(1_000_000),
  currency,
  minimumStay: z.number().int().min(1).max(365).optional(),
}).strict();

const ratesProposal = z.object({
  action: z.literal("upsert_rates"),
  propertyId: identifier,
  entries: z.array(rateEntrySchema).min(1).max(366),
}).strict();

const availabilityEntrySchema = z.object({
  date: isoDate,
  status: z.enum(["available", "blocked"]),
  minimumStay: z.number().int().min(1).max(365).optional(),
}).strict();

const availabilityProposal = z.object({
  action: z.literal("upsert_availability"),
  propertyId: identifier,
  entries: z.array(availabilityEntrySchema).min(1).max(366),
}).strict();

const listingPatchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(10_000).optional(),
  location: z.string().trim().min(1).max(300).optional(),
  amenities: z.array(z.string().trim().min(1).max(120)).max(100).optional(),
  checkInInstructions: z.string().trim().min(1).max(10_000).optional(),
}).strict().refine((patch) => Object.keys(patch).length > 0, "At least one listing field is required");

const listingContentProposal = z.object({
  action: z.literal("upsert_listing_content"),
  propertyId: identifier,
  patch: listingPatchSchema,
}).strict();

const reservationPatchSchema = z.object({
  checkIn: isoDate.optional(),
  checkOut: isoDate.optional(),
  guests: z.number().int().min(1).max(100).optional(),
  status: z.enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled"]).optional(),
  note: z.string().trim().max(4_000).optional(),
}).strict().superRefine((patch, context) => {
  if (Object.keys(patch).length === 0) {
    context.addIssue({ code: "custom", message: "At least one reservation field is required" });
  }
  if (patch.checkIn && patch.checkOut && patch.checkIn >= patch.checkOut) {
    context.addIssue({ code: "custom", path: ["checkOut"], message: "checkOut must be after checkIn" });
  }
});

const reservationModificationProposal = z.object({
  action: z.literal("modify_reservation"),
  propertyId: identifier,
  reservationId: identifier,
  patch: reservationPatchSchema,
}).strict();

export const guestMessageProposalSchema = guestMessageProposal;
export const ratesProposalSchema = ratesProposal;
export const availabilityProposalSchema = availabilityProposal;
export const listingContentProposalSchema = listingContentProposal;
export const reservationModificationProposalSchema = reservationModificationProposal;

export const proposalSchema = z.union([
  readProposalSchema,
  guestMessageProposalSchema,
  ratesProposalSchema,
  availabilityProposalSchema,
  listingContentProposalSchema,
  reservationModificationProposalSchema,
]);

export type ReadProposal = z.infer<typeof readProposalSchema>;
export type GuestMessageProposal = z.infer<typeof guestMessageProposalSchema>;
export type RatesProposal = z.infer<typeof ratesProposalSchema>;
export type AvailabilityProposal = z.infer<typeof availabilityProposalSchema>;
export type ListingContentProposal = z.infer<typeof listingContentProposalSchema>;
export type ReservationModificationProposal = z.infer<typeof reservationModificationProposalSchema>;
export type Proposal = z.infer<typeof proposalSchema>;

export function parseProposal(input: unknown): Proposal {
  return proposalSchema.parse(input);
}

export function safeParseProposal(input: unknown) {
  return proposalSchema.safeParse(input);
}
