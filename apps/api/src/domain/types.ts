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
