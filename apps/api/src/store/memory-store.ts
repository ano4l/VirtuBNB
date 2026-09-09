import { randomUUID } from "node:crypto";
import type {
  Activity, Approval, Booking, CalendarDay, Conversation, Dashboard, Insight, Listing, Message,
  PreviewAction, Property, RatePreview, Task,
} from "../domain/types.js";

const now = new Date();
const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
const day = (offset: number, hour = 12) => {
  const value = new Date(now);
  value.setUTCHours(hour, 0, 0, 0);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString();
};
const dateOnly = (offset: number) => day(offset).slice(0, 10);

export class MemoryStore {
  readonly properties: Property[] = [
    {
      id: "prop_rosebank",
      name: "Rosebank Loft",
      channel: "Airbnb",
      status: "occupied",
      nextStay: "Checkout today at 10:00",
      syncStatus: "healthy",
    },
    {
      id: "prop_sandton",
      name: "Sandton Studio",
      channel: "Airbnb",
      status: "turnover",
      nextStay: "Check-in today at 15:00",
      syncStatus: "warning",
    },
  ];

  readonly tasks: Task[] = [
    {
      id: "task_clean_sandton",
      propertyId: "prop_sandton",
      title: "Turnover clean",
      dueLabel: "Today, 11:00",
      assignee: "Lerato",
      status: "overdue",
    },
    {
      id: "task_keys_rosebank",
      propertyId: "prop_rosebank",
      title: "Return spare keys",
      dueLabel: "Today, 14:00",
      assignee: "Thabo",
      status: "open",
    },
  ];

  readonly approvals: Approval[] = [
    {
      id: "approval_checkin",
      code: "VH-1842",
      propertyId: "prop_rosebank",
      kind: "listing_text",
      field: "Check-in time",
      before: "14:00",
      after: "15:00",
      requestedBy: "whatsapp",
      status: "pending",
      createdAt: now.toISOString(),
      expiresAt: inTwoHours.toISOString(),
    },
  ];

  readonly activities: Activity[] = [
    {
      id: "activity_booking",
      type: "automation",
      title: "Booking workflow prepared",
      detail: "Sandton Studio check-in tasks were created.",
      occurredAt: now.toISOString(),
    },
    {
      id: "activity_sync",
      type: "sync",
      title: "Rosebank Loft synchronized",
      detail: "Reservation data is up to date.",
      occurredAt: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
    },
    {
      id: "activity_failure",
      type: "failure",
      title: "Sandton Studio sync needs attention",
      detail: "The demo provider did not confirm the latest refresh.",
      occurredAt: new Date(now.getTime() - 32 * 60 * 1000).toISOString(),
      retryable: true,
    },
  ];

  /** Provider-shaped records are intentionally local seed data. */
  readonly bookings: Booking[] = [
    {
      id: "booking_sarah", propertyId: "prop_sandton", guestName: "Sarah Mitchell", guestEmail: "sarah@example.test",
      channel: "Airbnb", status: "confirmed", checkIn: day(1, 15), checkOut: day(4, 10), guests: 2, nights: 3,
      total: 4350, currency: "ZAR", note: "Guest asked whether an earlier check-in is possible.",
      checkInInstructionsSent: true, createdAt: day(-14), updatedAt: day(0, 10),
    },
    {
      id: "booking_michael", propertyId: "prop_rosebank", guestName: "Michael Chen", guestEmail: "michael@example.test",
      channel: "Airbnb", status: "checked_out", checkIn: day(-3, 15), checkOut: day(0, 10), guests: 1, nights: 3,
      total: 3750, currency: "ZAR", note: "Thanked the host for a smooth check-out.",
      checkInInstructionsSent: true, createdAt: day(-28), updatedAt: day(0, 10),
    },
    {
      id: "booking_lerato", propertyId: "prop_sandton", guestName: "Lerato Mokoena", guestEmail: "lerato@example.test",
      channel: "Airbnb", status: "pending", checkIn: day(7, 15), checkOut: day(10, 10), guests: 4, nights: 3,
      total: 5100, currency: "ZAR", note: "Asking about parking for two cars.",
      checkInInstructionsSent: false, createdAt: day(-2), updatedAt: day(-1),
    },
    {
      id: "booking_james", propertyId: "prop_rosebank", guestName: "James Okonkwo", guestEmail: "james@example.test",
      channel: "Airbnb", status: "confirmed", checkIn: day(12, 15), checkOut: day(15, 10), guests: 2, nights: 3,
      total: 3900, currency: "ZAR", checkInInstructionsSent: false, createdAt: day(-5), updatedAt: day(-5),
    },
  ];

  readonly conversations: Conversation[] = [
    { id: "conversation_sarah", bookingId: "booking_sarah", propertyId: "prop_sandton", guestName: "Sarah Mitchell", channel: "Airbnb", unreadCount: 1, lastMessageAt: day(0, 10), lastMessagePreview: "Hi! Would it be possible to check in earlier?" },
    { id: "conversation_michael", bookingId: "booking_michael", propertyId: "prop_rosebank", guestName: "Michael Chen", channel: "Airbnb", unreadCount: 0, lastMessageAt: day(0, 9), lastMessagePreview: "Thanks for the smooth check-out!" },
    { id: "conversation_lerato", bookingId: "booking_lerato", propertyId: "prop_sandton", guestName: "Lerato Mokoena", channel: "Airbnb", unreadCount: 2, lastMessageAt: day(-1, 16), lastMessagePreview: "Is parking available for 2 cars?" },
    { id: "conversation_james", bookingId: "booking_james", propertyId: "prop_rosebank", guestName: "James Okonkwo", channel: "Airbnb", unreadCount: 0, lastMessageAt: day(-2, 11), lastMessagePreview: "Looking forward to staying!" },
  ];

  readonly messages: Message[] = [
    { id: "message_sarah_guest", conversationId: "conversation_sarah", role: "guest", body: "Hi! Would it be possible to check in earlier?", status: "received", createdAt: day(0, 10) },
    { id: "message_sarah_host", conversationId: "conversation_sarah", role: "host", body: "I’ll check that for you and come back shortly.", status: "approved", createdAt: day(0, 10) },
    { id: "message_michael_guest", conversationId: "conversation_michael", role: "guest", body: "Thanks for the smooth check-out!", status: "received", createdAt: day(0, 9) },
    { id: "message_lerato_guest", conversationId: "conversation_lerato", role: "guest", body: "Is parking available for 2 cars?", status: "received", createdAt: day(-1, 16) },
    { id: "message_james_guest", conversationId: "conversation_james", role: "guest", body: "Looking forward to staying!", status: "received", createdAt: day(-2, 11) },
  ];

  readonly listings: Listing[] = [
    {
      id: "listing_sandton", propertyId: "prop_sandton", title: "Sandton City Apartment", location: "Sandton, Johannesburg", status: "active",
      description: "A beautiful modern apartment in the heart of Sandton. Fully equipped with a gourmet kitchen, high-speed fibre, and stunning city views. Perfect for business and leisure travellers alike.",
      nightlyRate: 1450, weekendRate: 1750, cleaningFee: 350, minimumStay: 2, occupancy: 82, monthlyRevenue: 24600, rating: 4.92, reviewCount: 87,
      photos: ["https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&h=600&fit=crop&auto=format", "https://images.unsplash.com/photo-1757924461488-ef9ad0670978?w=800&h=600&fit=crop&auto=format"],
      amenities: ["Wi-Fi", "Kitchen", "Workspace", "Parking"], checkInTime: "15:00", checkOutTime: "10:00", lastSyncedAt: now.toISOString(),
    },
    {
      id: "listing_rosebank", propertyId: "prop_rosebank", title: "Rosebank Designer Loft", location: "Rosebank, Johannesburg", status: "active",
      description: "A calm designer loft near Rosebank’s restaurants, galleries, and business district.",
      nightlyRate: 1250, weekendRate: 1500, cleaningFee: 300, minimumStay: 2, occupancy: 74, monthlyRevenue: 18250, rating: 4.88, reviewCount: 64,
      photos: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop&auto=format"],
      amenities: ["Wi-Fi", "Kitchen", "Air conditioning"], checkInTime: "14:00", checkOutTime: "10:00", lastSyncedAt: now.toISOString(),
    },
    {
      id: "listing_melrose", propertyId: "prop_melrose", title: "Melrose Penthouse", location: "Melrose, Johannesburg", status: "inactive",
      description: "A light-filled penthouse with a private terrace and skyline views.",
      nightlyRate: 2200, weekendRate: 2600, cleaningFee: 450, minimumStay: 2, occupancy: 68, monthlyRevenue: 0, rating: 4.96, reviewCount: 32,
      photos: ["https://images.unsplash.com/photo-1630699144035-c0f6311ec482?w=800&h=1200&fit=crop&auto=format"], amenities: ["Wi-Fi", "Terrace", "Kitchen"],
      checkInTime: "15:00", checkOutTime: "10:00", lastSyncedAt: now.toISOString(),
    },
  ];

  readonly calendar: CalendarDay[] = [];

  readonly insights: Insight[] = [
    { id: "insight_weekend_rates", kind: "pricing", title: "Weekend demand is strong", body: "Your weekends are averaging 91% occupancy. Increasing Friday and Saturday rates by 8–12% could improve revenue without significantly affecting occupancy.", metric: "91% weekend occupancy", change: "+8–12% opportunity", recommendation: "Preview a weekend rate adjustment", status: "new", createdAt: now.toISOString() },
    { id: "insight_sandton_occupancy", kind: "occupancy", title: "Sandton is your strongest listing", body: "Sandton City Apartment is running ahead of the portfolio average this month.", metric: "82% occupancy", change: "+3.2%", recommendation: "Review available dates and pricing", status: "new", createdAt: day(-1) },
  ];

  readonly previewActions: PreviewAction[] = [];

  constructor() {
    for (let offset = -3; offset < 45; offset += 1) {
      for (const listing of this.listings) {
        const booking = this.bookings.find((item) => item.propertyId === listing.propertyId && dateOnly(offset) >= item.checkIn.slice(0, 10) && dateOnly(offset) < item.checkOut.slice(0, 10));
        const status: CalendarDay["status"] = booking ? "booked" : offset === 0 && listing.propertyId === "prop_rosebank" ? "turnover" : "available";
        this.calendar.push({ date: dateOnly(offset), propertyId: listing.propertyId, status, ...(booking ? { bookingId: booking.id } : {}), nightlyRate: offset % 7 >= 4 ? listing.weekendRate : listing.nightlyRate, currency: "ZAR", minimumStay: listing.minimumStay });
      }
    }
  }

  getDashboard(): Dashboard {
    const overdue = this.tasks.filter((task) => task.status === "overdue").length;
    const pending = this.approvals.filter((approval) => approval.status === "pending" && Date.parse(approval.expiresAt) > Date.now()).length;
    return {
      briefing:
        `Demo portfolio: two arrivals and one checkout. ${overdue} overdue task(s). ${pending} listing change(s) awaiting approval.`,
      whatsappConnected: false,
      arrivals: 2,
      departures: 1,
      openTasks: this.tasks.filter((task) => task.status !== "completed").length,
      pendingApprovals: pending,
    };
  }

  getBookings(filters: { status?: Booking["status"]; from?: string; to?: string } = {}): Booking[] {
    return this.bookings.filter((booking) => {
      if (filters.status && booking.status !== filters.status) return false;
      if (filters.from && booking.checkOut.slice(0, 10) < filters.from) return false;
      if (filters.to && booking.checkIn.slice(0, 10) > filters.to) return false;
      return true;
    });
  }

  getBooking(id: string) { return this.bookings.find((booking) => booking.id === id); }

  getConversations() { return [...this.conversations].sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt)); }

  getConversation(id: string) {
    const conversation = this.conversations.find((item) => item.id === id);
    if (!conversation) return undefined;
    return { ...conversation, messages: this.messages.filter((message) => message.conversationId === id).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)) };
  }

  createGuestReplyPreview(conversationId: string, body: string): PreviewAction | undefined {
    const conversation = this.conversations.find((item) => item.id === conversationId);
    const trimmed = body.trim();
    if (!conversation || !trimmed || trimmed.length > 4096) return undefined;
    const action: PreviewAction = {
      id: randomUUID(), kind: "guest_message", title: `Reply to ${conversation.guestName}`,
      summary: "Reply prepared for review. It has not been sent to Airbnb or WhatsApp.", propertyId: conversation.propertyId,
      ...(conversation.bookingId ? { bookingId: conversation.bookingId } : {}), conversationId, payload: { body: trimmed }, status: "pending", destructive: false,
      createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    };
    this.previewActions.unshift(action);
    this.messages.push({ id: randomUUID(), conversationId, role: "host", body: trimmed, status: "preview", createdAt: action.createdAt });
    return action;
  }

  createBookingActionPreview(bookingId: string, actionName: string): PreviewAction | undefined {
    const booking = this.getBooking(bookingId);
    if (!booking || !["message", "call", "check-in-details", "modify-booking"].includes(actionName)) return undefined;
    const action: PreviewAction = {
      id: randomUUID(), kind: "booking_action", title: `${actionName.replaceAll("-", " ")} for ${booking.guestName}`,
      summary: `Preview only. The ${actionName.replaceAll("-", " ")} action was recorded locally and no provider was contacted.`,
      propertyId: booking.propertyId, bookingId, payload: { action: actionName }, status: "pending", destructive: actionName === "modify-booking",
      createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    };
    this.previewActions.unshift(action);
    return action;
  }

  createCalendarPreview(propertyId: string, from: string, to: string, kind: "block" | "unblock" = "block"): PreviewAction | undefined {
    const listing = this.listings.find((item) => item.propertyId === propertyId);
    if (!listing || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) return undefined;
    const action: PreviewAction = {
      id: randomUUID(), kind: "calendar_update", title: `${kind === "block" ? "Block" : "Open"} dates for ${listing.title}`,
      summary: `Preview only. ${from} to ${to} will be ${kind === "block" ? "held locally" : "opened locally"} after confirmation; the provider calendar remains unchanged.`,
      propertyId, payload: { from, to, kind }, status: "pending", destructive: kind === "block",
      createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    };
    this.previewActions.unshift(action);
    return action;
  }

  createPricingPreview(insightId: string): PreviewAction | undefined {
    const insight = this.insights.find((item) => item.id === insightId);
    if (!insight) return undefined;
    const listing = this.listings.find((item) => item.propertyId === "prop_sandton");
    const action: PreviewAction = {
      id: randomUUID(), kind: "pricing_update", title: "Preview weekend pricing optimisation",
      summary: "A local rate suggestion is ready for review. No listing or provider rate has been changed.", ...(listing ? { propertyId: listing.propertyId } : {}),
      payload: { insightId, adjustment: "8–12%", days: ["Friday", "Saturday"] }, status: "pending", destructive: false,
      createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    };
    this.previewActions.unshift(action);
    insight.status = "previewed";
    return action;
  }

  decidePreviewAction(id: string, decision: "approved" | "rejected"): PreviewAction | undefined {
    const action = this.previewActions.find((item) => item.id === id);
    if (!action || action.status !== "pending" || Date.parse(action.expiresAt) <= Date.now()) return undefined;
    action.status = decision;
    this.activities.unshift({ id: randomUUID(), type: "user", title: `Preview ${decision}`, detail: `${action.title}. Demo only; no external provider was contacted.`, occurredAt: new Date().toISOString() });
    return action;
  }

  getCalendar(propertyId: string | undefined, from: string, to: string): CalendarDay[] {
    return this.calendar.filter((dayItem) => (!propertyId || dayItem.propertyId === propertyId) && dayItem.date >= from && dayItem.date <= to);
  }

  getRatePreview(propertyId: string, from: string, to: string): RatePreview | undefined {
    const listing = this.listings.find((item) => item.propertyId === propertyId);
    const start = new Date(`${from}T12:00:00.000Z`);
    const end = new Date(`${to}T12:00:00.000Z`);
    const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
    if (!listing || !Number.isFinite(nights) || nights <= 0 || nights > 365) return undefined;
    let total = 0; let weekend = false;
    for (let index = 0; index < nights; index += 1) {
      const current = new Date(start); current.setUTCDate(current.getUTCDate() + index);
      const rate = [5, 6].includes(current.getUTCDay()) ? listing.weekendRate : listing.nightlyRate;
      weekend ||= rate === listing.weekendRate; total += rate;
    }
    return { propertyId, from, to, nights, nightlyRate: Math.round(total / nights), total, currency: "ZAR", reason: weekend ? "weekend" : "base" };
  }

  findProperty(input: string): Property | undefined {
    const normalized = input.toLowerCase();
    const matches = this.properties.filter(
      (property) =>
        normalized.includes(property.name.toLowerCase()) ||
        property.name
          .toLowerCase()
          .split(" ")
          .some((part) => ["rosebank", "sandton"].includes(part) && normalized.includes(part)),
    );
    return matches.length === 1 ? matches[0] : undefined;
  }

  createPhotoApproval(property: Property, mediaId: string): Approval {
    const approval: Approval = {
      id: randomUUID(),
      code: `VH-${randomUUID()}`,
      propertyId: property.id,
      kind: "listing_photo",
      mediaId,
      field: "Cover photo",
      before: "Current listing cover",
      after: `Staged WhatsApp image ${mediaId.slice(-6)}`,
      requestedBy: "whatsapp",
      status: "pending",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    };
    this.approvals.unshift(approval);
    this.activities.unshift({
      id: randomUUID(),
      type: "user",
      title: "Photo change staged",
      detail: `${property.name} has a new cover-photo proposal.`,
      occurredAt: new Date().toISOString(),
    });
    return approval;
  }

  createListingApproval(property: Property, field: string, after: string): Approval {
    const approval: Approval = {
      id: randomUUID(), code: `VH-${randomUUID()}`, propertyId: property.id,
      kind: "listing_text", field, before: field === "Check-in time" ? "14:00 (demo)" : "Existing description (demo)",
      after, requestedBy: "whatsapp", status: "pending",
      createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7200000).toISOString(),
    };
    this.approvals.unshift(approval);
    this.activities.unshift({ id: randomUUID(), type: "user", title: "Listing change proposed",
      detail: `${property.name}: ${field}. Awaiting approval.`, occurredAt: new Date().toISOString() });
    return approval;
  }

  decideApproval(codeOrId: string, decision: "approved" | "rejected"): Approval | undefined {
    const approval = this.approvals.find(
      (item) => item.id === codeOrId || item.code.toLowerCase() === codeOrId.toLowerCase(),
    );
    if (!approval || approval.status !== "pending" || Date.parse(approval.expiresAt) <= Date.now()) return undefined;
    approval.status = decision;
    const property = this.properties.find((item) => item.id === approval.propertyId);
    this.activities.unshift({
      id: randomUUID(),
      type: "user",
      title: `Change ${decision}`,
      detail: `${approval.field} for ${property?.name ?? "property"}. Demo only, no live listing was changed.`,
      occurredAt: new Date().toISOString(),
    });
    return approval;
  }

  completeTask(taskId: string): Task | undefined {
    const task = this.tasks.find((item) => item.id === taskId);
    if (!task) return undefined;
    if (task.status === "completed") return task;
    task.status = "completed";
    this.activities.unshift({
      id: randomUUID(),
      type: "user",
      title: "Task completed",
      detail: task.title,
      occurredAt: new Date().toISOString(),
    });
    return task;
  }

  retryActivity(activityId: string): Activity | undefined {
    const activity = this.activities.find((item) => item.id === activityId && item.retryable);
    if (!activity) return undefined;
    activity.retryable = false;
    activity.detail = "Retry queued in demo mode. No external provider was contacted.";
    return activity;
  }
}
