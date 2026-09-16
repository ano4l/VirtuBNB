export type Property = {
  id: string;
  name: string;
  channel: "Airbnb";
  status: "occupied" | "turnover" | "available";
  nextStay: string;
  syncStatus: "healthy" | "warning";
};

export type Task = {
  id: string;
  propertyId: string;
  title: string;
  dueLabel: string;
  assignee: string;
  status: "open" | "overdue" | "completed";
};

export type Approval = {
  id: string;
  code: string;
  propertyId: string;
  kind: "listing_text" | "listing_photo";
  mediaId?: string;
  field: string;
  before: string;
  after: string;
  requestedBy: "whatsapp" | "mobile";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  expiresAt: string;
};

export type Activity = {
  id: string;
  type: "user" | "automation" | "sync" | "failure";
  title: string;
  detail: string;
  occurredAt: string;
  retryable?: boolean;
};

export type Dashboard = {
  briefing: string;
  whatsappConnected: boolean;
  arrivals: number;
  departures: number;
  openTasks: number;
  pendingApprovals: number;
};

/** A reservation in the provider-free demo workspace. Dates are ISO strings. */
export type Booking = {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail?: string;
  channel: "Airbnb";
  status: "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  total: number;
  currency: "ZAR";
  note?: string;
  checkInInstructionsSent: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Conversation = {
  id: string;
  bookingId?: string;
  propertyId: string;
  guestName: string;
  channel: "Airbnb" | "WhatsApp";
  unreadCount: number;
  lastMessageAt: string;
  lastMessagePreview: string;
};

export type Message = {
  id: string;
  conversationId: string;
  role: "guest" | "host" | "assistant" | "system";
  body: string;
  status: "received" | "draft" | "preview" | "approved";
  createdAt: string;
};

export type Listing = {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  location: string;
  status: "active" | "inactive";
  nightlyRate: number;
  weekendRate: number;
  cleaningFee: number;
  minimumStay: number;
  occupancy: number;
  monthlyRevenue: number;
  rating: number;
  reviewCount: number;
  photos: string[];
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  lastSyncedAt: string;
};

export type CalendarDay = {
  date: string;
  propertyId: string;
  status: "available" | "booked" | "blocked" | "turnover";
  bookingId?: string;
  nightlyRate: number;
  currency: "ZAR";
  minimumStay: number;
  note?: string;
};

export type RatePreview = {
  propertyId: string;
  from: string;
  to: string;
  nights: number;
  nightlyRate: number;
  total: number;
  currency: "ZAR";
  reason: "base" | "weekend" | "preview";
};

export type Insight = {
  id: string;
  kind: "pricing" | "occupancy" | "revenue";
  title: string;
  body: string;
  metric: string;
  change?: string;
  recommendation: string;
  status: "new" | "previewed" | "dismissed";
  createdAt: string;
};

export type PreviewAction = {
  id: string;
  kind: "guest_message" | "booking_action" | "listing_update" | "calendar_update" | "pricing_update";
  title: string;
  summary: string;
  propertyId?: string;
  bookingId?: string;
  conversationId?: string;
  payload: Record<string, string | number | boolean | string[]>;
  status: "pending" | "approved" | "rejected";
  destructive: boolean;
  createdAt: string;
  expiresAt: string;
};

/** Durable command intake shape. In development it is stored in SQLite; the
 * production PostgreSQL repository will use the same contract. */
export type AgentCommand = {
  id: string;
  instruction: string;
  source: "deterministic" | "gpt-5.6-luna" | "unavailable";
  status: "answered" | "proposed" | "planner_unavailable";
  proposal?: Readonly<Record<string, unknown>>;
  createdAt: string;
};

/** Provider-neutral production domain. The existing types above remain the
 * demo contract until the API routes are migrated onto repositories. */
export type ProviderName = "nextpax" | "fake";
export type BookingChannel = "airbnb" | "booking_com" | "vrbo" | "direct" | "other";

export type Organization = {
  id: string;
  name: string;
  status: "active" | "suspended";
  createdAt: string;
};

export type User = {
  id: string;
  organizationId: string;
  displayName: string;
  role: "owner" | "manager" | "operations" | "service_provider";
  status: "active" | "disabled";
};

export type IntegrationConnection = {
  id: string;
  organizationId: string;
  provider: ProviderName;
  status: "pending" | "active" | "degraded" | "disconnected";
  externalAccountId?: string;
  capabilitiesCheckedAt?: string;
  lastSuccessfulSyncAt?: string;
};

export type ListingMapping = {
  id: string;
  organizationId: string;
  connectionId: string;
  propertyId: string;
  channel: BookingChannel;
  externalPropertyId: string;
  externalListingId?: string;
  externalUnitId?: string;
  status: "pending" | "active" | "error" | "disconnected";
};

export type ReservationRecord = {
  id: string;
  organizationId: string;
  connectionId: string;
  propertyId: string;
  channel: BookingChannel;
  externalReservationId: string;
  status: "inquiry" | "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
  checkIn: string;
  checkOut: string;
  guestCount: number;
  currency: string;
  totalAmount?: number;
  currentRevision: number;
  createdAt: string;
  updatedAt: string;
};

export type ReservationRevision = {
  id: string;
  organizationId: string;
  reservationId: string;
  providerRevisionId: string;
  revision: number;
  eventKind: "created" | "modified" | "cancelled" | "reconciled";
  snapshot: Readonly<Record<string, unknown>>;
  receivedAt: string;
};

export type InboundProviderEvent = {
  id: string;
  organizationId: string;
  connectionId: string;
  provider: ProviderName;
  providerEventId: string;
  eventType: string;
  payloadHash: string;
  status: "received" | "processing" | "processed" | "retryable" | "quarantined";
  attempts: number;
  receivedAt: string;
  processedAt?: string;
};

export type OutboundProviderCommand = {
  id: string;
  organizationId: string;
  connectionId: string;
  proposalId?: string;
  idempotencyKey: string;
  kind: "send_guest_message" | "upsert_rates" | "upsert_availability" | "upsert_listing_content" | "modify_reservation";
  payload: Readonly<Record<string, unknown>>;
  status: "pending" | "dispatching" | "accepted" | "confirmed" | "retryable" | "dead_letter" | "rejected";
  attempts: number;
  createdAt: string;
  confirmedAt?: string;
};

export type ProviderConfirmation = {
  id: string;
  organizationId: string;
  commandId: string;
  providerReference?: string;
  status: "pending" | "confirmed" | "rejected" | "mismatch";
  receivedAt: string;
  details?: Readonly<Record<string, unknown>>;
};

export type AuditEventRecord = {
  id: string;
  organizationId: string;
  actorType: "user" | "automation" | "provider" | "system";
  actorId?: string;
  action: string;
  subjectType: string;
  subjectId: string;
  correlationId: string;
  outcome: "proposed" | "approved" | "rejected" | "attempted" | "confirmed" | "failed";
  metadata: Readonly<Record<string, unknown>>;
  occurredAt: string;
};
