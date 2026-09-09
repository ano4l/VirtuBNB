export type Property = {
  id: string;
  name: string;
  channel: "Airbnb";
  status: "occupied" | "turnover" | "available";
  nextStay: string;
  syncStatus: "healthy" | "warning";
};

export type Task = { id: string; propertyId: string; title: string; dueLabel: string; assignee: string; status: "open" | "overdue" | "completed" };
export type Approval = { id: string; code: string; propertyId: string; kind: "listing_text" | "listing_photo"; field: string; before: string; after: string; requestedBy: "whatsapp" | "mobile"; status: "pending" | "approved" | "rejected"; createdAt: string; expiresAt: string };
export type Activity = { id: string; type: "user" | "automation" | "sync" | "failure"; title: string; detail: string; occurredAt: string; retryable?: boolean };
export type Dashboard = { briefing: string; whatsappConnected: boolean; arrivals: number; departures: number; openTasks: number; pendingApprovals: number };
export type Snapshot = { properties: Property[]; tasks: Task[]; approvals: Approval[]; activities: Activity[]; bookings?: Booking[]; conversations?: Conversation[]; listings?: Listing[]; calendar?: CalendarDay[]; insights?: Insight[]; previewActions?: PreviewAction[]; dashboard: Dashboard; delivery?: { pending: number; failed: number }; mode: string; syncedAt: string };
export type Booking = { id: string; propertyId: string; guestName: string; channel: "Airbnb"; status: string; checkIn: string; checkOut: string; guests: number; nights: number; total: number; currency: "ZAR"; checkInInstructionsSent: boolean };
export type Conversation = { id: string; bookingId?: string; propertyId: string; guestName: string; channel: "Airbnb" | "WhatsApp"; unreadCount: number; lastMessageAt: string; lastMessagePreview: string };
export type Listing = { id: string; propertyId: string; title: string; description: string; location: string; status: "active" | "inactive"; nightlyRate: number; weekendRate: number; cleaningFee: number; minimumStay: number; occupancy: number; monthlyRevenue: number; rating: number; reviewCount: number; photos: string[]; amenities: string[]; checkInTime: string; checkOutTime: string; lastSyncedAt: string };
export type CalendarDay = { date: string; propertyId: string; status: "available" | "booked" | "blocked" | "turnover"; bookingId?: string; nightlyRate: number; currency: "ZAR"; minimumStay: number; note?: string };
export type Insight = { id: string; kind: "pricing" | "occupancy" | "revenue"; title: string; body: string; metric: string; change?: string; recommendation: string; status: string; createdAt: string };
export type PreviewAction = { id: string; kind: string; title: string; summary: string; status: "pending" | "approved" | "rejected"; destructive: boolean; createdAt: string; expiresAt: string };
export type RatePreview = { propertyId: string; from: string; to: string; nights: number; nightlyRate: number; total: number; currency: "ZAR"; reason: "base" | "weekend" | "preview" };

const base = ((import.meta.env.VITE_API_URL as string | undefined) ?? (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "").replace(/\/$/, "");
const SESSION_KEY = "virtuhost.session";

export const sessionToken = () => sessionStorage.getItem(SESSION_KEY);
export const saveSession = (token: string) => sessionStorage.setItem(SESSION_KEY, token);
export const clearSession = () => sessionStorage.removeItem(SESSION_KEY);

export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }

async function request<T>(path: string, init: RequestInit = {}) {
  const token = sessionToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${base}${path}`, { ...init, headers });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { message = (await response.json()).error ?? message; } catch { /* non-json error */ }
    throw new ApiError(response.status, message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  pair: async (code: string) => { const value = await request<{ token: string; expiresAt: string }>("/auth/pair", { method: "POST", body: JSON.stringify({ code }) }); saveSession(value.token); return value; },
  snapshot: () => request<Snapshot>("/api/snapshot"),
  bookings: (status?: string) => request<{ data: Booking[] }>(`/api/bookings${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  booking: (id: string) => request<Booking & { property?: Property; conversation?: Conversation }>(`/api/bookings/${id}`),
  bookingAction: (id: string, action: string) => request<PreviewAction>(`/api/bookings/${id}/action`, { method: "POST", body: JSON.stringify({ action }) }),
  conversations: () => request<{ data: Conversation[] }>("/api/conversations"),
  conversation: (id: string) => request<Conversation & { messages?: Array<{ id: string; role: string; body: string; status: string; createdAt: string }> }>(`/api/conversations/${id}`),
  replyPreview: (id: string, body: string) => request<{ action: PreviewAction }>(`/api/conversations/${id}/reply-preview`, { method: "POST", body: JSON.stringify({ body }) }),
  listings: () => request<{ data: Listing[] }>("/api/listings"),
  listing: (id: string) => request<Listing & { property?: Property }>(`/api/listings/${id}`),
  listingEditPreview: (id: string, field: string, value: string) => request<{ approval: unknown }>(`/api/listings/${id}/edit-preview`, { method: "POST", body: JSON.stringify({ [field]: value }) }),
  calendar: (propertyId = "prop_sandton", from?: string, to?: string) => { const query = new URLSearchParams({ propertyId }); if (from) query.set("from", from); if (to) query.set("to", to); return request<{ data: CalendarDay[] }>(`/api/calendar?${query.toString()}`); },
  calendarPreview: (propertyId: string, from: string, to: string, kind: "block" | "unblock") => request<{ action: PreviewAction }>("/api/calendar/preview", { method: "POST", body: JSON.stringify({ propertyId, from, to, kind }) }),
  calendarRatePreview: (propertyId: string, from: string, to: string) => request<RatePreview>(`/api/calendar/rate-preview?propertyId=${encodeURIComponent(propertyId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  insights: () => request<{ data: Insight[] }>("/api/insights"),
  optimiseInsight: (id: string) => request<{ action: PreviewAction }>(`/api/insights/${id}/optimise`, { method: "POST" }),
  previewActions: () => request<{ data: PreviewAction[] }>("/api/preview-actions"),
  decidePreviewAction: (id: string, decision: "approved" | "rejected") => request<PreviewAction>(`/api/preview-actions/${id}/decision`, { method: "POST", body: JSON.stringify({ decision }) }),
  completeTask: (id: string) => request<Task>(`/api/tasks/${id}/complete`, { method: "POST" }),
  decideApproval: (id: string, decision: "approved" | "rejected") => request<Approval>(`/api/approvals/${id}/decision`, { method: "POST", body: JSON.stringify({ decision }) }),
  retryActivity: (id: string) => request<Activity>(`/api/activity/${id}/retry`, { method: "POST" }),
  demoCommand: (text: string) => request<{ reply: string }>("/api/demo/command", { method: "POST", body: JSON.stringify({ text }) }),
  revoke: () => request<void>("/api/session", { method: "DELETE" }),
};
