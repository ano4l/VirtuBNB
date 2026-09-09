import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { timingSafeEqual } from "node:crypto";
import type { AppConfig } from "./config.js";
import { CommandEngine } from "./agent/command-engine.js";
import { SqliteStore } from "./store/sqlite-store.js";
import { extractMessages, type WhatsAppInboundMessage } from "./whatsapp/types.js";
import { verifyMetaSignature } from "./whatsapp/signature.js";
import {
  CloudWhatsAppTransport,
  DemoWhatsAppTransport,
  type WhatsAppTransport,
} from "./whatsapp/transport.js";

const dateParam = (offset: number) => {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

export type AppDependencies = {
  store?: SqliteStore;
  transport?: WhatsAppTransport;
};

function makeTransport(config: AppConfig): WhatsAppTransport {
  if (config.WHATSAPP_TRANSPORT === "cloud") {
    return new CloudWhatsAppTransport(
      config.WHATSAPP_ACCESS_TOKEN!,
      config.WHATSAPP_PHONE_NUMBER_ID!,
      config.WHATSAPP_GRAPH_API_VERSION!,
    );
  }
  return new DemoWhatsAppTransport();
}

export function createApp(
  config: AppConfig,
  dependencies: AppDependencies = {},
): { app: Express; store: SqliteStore; flushReplies: () => Promise<void> } {
  const app = express();
  const store = dependencies.store ?? new SqliteStore(config.DATABASE_PATH);
  const transport = dependencies.transport ?? makeTransport(config);
  const engine = new CommandEngine(store);
  const sending = new Map<string, Promise<boolean>>();
  const deliver = (key: string): Promise<boolean> => {
    const current = sending.get(key);
    if (current) return current;
    const reply = store.claimReply(key);
    if (!reply) return Promise.resolve(store.replyDelivered(key));
    const job = (async () => {
      try {
        // A removed host must not receive a queued response after reconfiguration.
        if (!allowedHosts.has(reply.recipient)) return false;
        await transport.sendText(reply.recipient, reply.body);
        store.finishReply(key, true);
        return true;
      } catch {
        store.finishReply(key, false);
        return false;
      } finally { sending.delete(key); }
    })();
    sending.set(key, job);
    return job;
  };
  const flushReplies = async () => { for (const reply of store.pendingReplies()) await deliver(reply.key); };
  const allowedHosts = new Set(config.HOST_WHATSAPP_NUMBERS?.split(",") ?? []);
  const authorized = (header: string | undefined): boolean => {
    if (!config.HOST_API_TOKEN || !header) return false;
    const expected = Buffer.from(`Bearer ${config.HOST_API_TOKEN}`);
    const received = Buffer.from(header);
    return received.length === expected.length && timingSafeEqual(received, expected);
  };

  app.disable("x-powered-by");
  app.use(cors());

  app.get("/webhooks/whatsapp", (request: Request, response: Response) => {
    const mode = request.query["hub.mode"];
    const verifyToken = request.query["hub.verify_token"];
    const challenge = request.query["hub.challenge"];
    if (mode === "subscribe" && verifyToken === config.WHATSAPP_VERIFY_TOKEN && typeof challenge === "string") {
      response.status(200).send(challenge);
      return;
    }
    response.sendStatus(403);
  });

  app.post(
    "/webhooks/whatsapp",
    express.raw({ type: "application/json", limit: "2mb" }),
    async (request: Request, response: Response) => {
      const rawBody = Buffer.isBuffer(request.body) ? request.body : Buffer.from("");
      if (config.META_APP_SECRET) {
        const signature = request.header("x-hub-signature-256");
        if (!verifyMetaSignature(rawBody, signature, config.META_APP_SECRET)) {
          response.sendStatus(401);
          return;
        }
      }

      let messages: WhatsAppInboundMessage[];
      try {
        messages = extractMessages(JSON.parse(rawBody.toString("utf8")));
      } catch {
        response.status(400).json({ error: "Invalid JSON payload" });
        return;
      }

      let failed = false;
      for (const message of messages) {
        if (!allowedHosts.has(message.from)) continue;
        try {
          const key = `${message.from}:${message.id}`;
          store.prepareReply(key, message.from, () => engine.handle(message));
          if (!await deliver(key)) failed = true;
        } catch (error) {
          failed = true;
          console.error("WhatsApp delivery failed; webhook retry required.");
        }
      }
      response.sendStatus(failed ? 503 : 200);
    },
  );

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", transport: config.WHATSAPP_TRANSPORT });
  });

  const pairingAttempts = new Map<string, { count: number; expires: number }>();
  app.post("/auth/pair", (request, response) => {
    const ip = request.ip ?? "unknown";
    for (const [key, value] of pairingAttempts) if (value.expires < Date.now()) pairingAttempts.delete(key);
    const attempts = pairingAttempts.get(ip) ?? { count: 0, expires: Date.now() + 60000 };
    pairingAttempts.set(ip, attempts);
    if (++attempts.count > 10) { response.status(429).json({ error: "Please wait a minute before trying again." }); return; }
    const code = request.body?.code;
    if (typeof code !== "string" || !/^[a-f0-9]{32}$/.test(code)) { response.status(400).json({ error: "Enter the pairing code from the host console." }); return; }
    const session = store.redeemPairing(code);
    if (!session) { response.status(401).json({ error: "Pairing code expired or already used." }); return; }
    response.set("Cache-Control", "no-store").json(session);
  });

  app.use("/api", (request, response, next) => {
    const header = request.header("authorization");
    if (!authorized(header) && !store.validSession(header?.match(/^Bearer (.+)$/)?.[1] ?? "")) {
      response.status(401).json({ error: "Host authentication required" });
      return;
    }
    response.set("Cache-Control", "no-store");
    store.reload();
    next();
  });

  app.post("/api/devices/pairing", (request, response) => {
    if (!authorized(request.header("authorization"))) { response.sendStatus(403); return; }
    response.json(store.createPairing());
  });
  app.delete("/api/session", (request, response) => {
    store.revokeSession(request.header("authorization")?.replace(/^Bearer /, "") ?? "");
    response.sendStatus(204);
  });
  app.get("/api/snapshot", (_request, response) => response.json({
    properties: store.properties, tasks: store.tasks, approvals: store.approvals, activities: store.activities,
    bookings: store.bookings, conversations: store.conversations, messages: store.messages, listings: store.listings,
    calendar: store.calendar, insights: store.insights, previewActions: store.previewActions,
    dashboard: store.getDashboard(), delivery: store.deliverySummary(), mode: "demo-data", syncedAt: new Date().toISOString(),
  }));

  app.post("/api/demo/command", (request, response) => {
    if (config.WHATSAPP_TRANSPORT !== "demo") { response.sendStatus(404); return; }
    const text = request.body?.text;
    if (typeof text !== "string" || text.length < 1 || text.length > 4096) {
      response.status(400).json({ error: "Provide a text command of 1 to 4096 characters." }); return;
    }
    response.json({ reply: store.transaction(() => engine.handle({ id: "local-command", from: "local", timestamp: String(Date.now()), type: "text", text: { body: text } })) });
  });

  app.get("/api/dashboard", (_request, response) => response.json(store.getDashboard()));
  app.get("/api/properties", (_request, response) => response.json({ data: store.properties }));
  app.get("/api/tasks", (_request, response) => response.json({ data: store.tasks }));
  app.get("/api/approvals", (_request, response) => response.json({ data: store.approvals }));
  app.get("/api/activity", (_request, response) => response.json({ data: store.activities }));

  app.get("/api/bookings", (request, response) => {
    const status = typeof request.query.status === "string" ? request.query.status : undefined;
    const allowed = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"];
    if (status && !allowed.includes(status)) { response.status(400).json({ error: "Unknown booking status" }); return; }
    const from = typeof request.query.from === "string" ? request.query.from : undefined;
    const to = typeof request.query.to === "string" ? request.query.to : undefined;
    const filters = { ...(status ? { status: status as "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled" } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) };
    response.json({ data: store.getBookings(filters), mode: "demo-data" });
  });

  app.get("/api/bookings/:bookingId", (request, response) => {
    const booking = store.getBooking(request.params.bookingId);
    if (!booking) { response.status(404).json({ error: "Booking not found" }); return; }
    response.json({ ...booking, property: store.properties.find((property) => property.id === booking.propertyId), conversation: store.conversations.find((item) => item.bookingId === booking.id), mode: "demo-data" });
  });

  app.post("/api/bookings/:bookingId/action", (request, response) => {
    const actionName = request.body?.action;
    if (typeof actionName !== "string") { response.status(400).json({ error: "Provide a booking action." }); return; }
    const action = store.transaction(() => store.createBookingActionPreview(request.params.bookingId, actionName));
    if (!action) { response.status(404).json({ error: "Booking or action not found" }); return; }
    response.status(201).json(action);
  });

  app.get("/api/conversations", (_request, response) => response.json({ data: store.getConversations(), mode: "demo-data" }));
  app.get("/api/conversations/:conversationId", (request, response) => {
    const conversation = store.getConversation(request.params.conversationId);
    if (!conversation) { response.status(404).json({ error: "Conversation not found" }); return; }
    response.json({ ...conversation, mode: "demo-data" });
  });

  const createReplyPreview = (request: Request, response: Response) => {
    const body = request.body?.body ?? request.body?.message;
    if (typeof body !== "string" || !body.trim()) { response.status(400).json({ error: "Provide a reply body." }); return; }
    const action = store.transaction(() => store.createGuestReplyPreview(String(request.params.conversationId), body));
    if (!action) { response.status(404).json({ error: "Conversation not found or reply is too long" }); return; }
    response.status(201).json({ action, message: store.messages.at(-1), mode: "demo-preview" });
  };
  app.post("/api/conversations/:conversationId/reply-preview", createReplyPreview);
  app.post("/api/conversations/:conversationId/messages", createReplyPreview);

  app.get("/api/listings", (_request, response) => response.json({ data: store.listings, mode: "demo-data" }));
  app.get("/api/listings/:propertyId", (request, response) => {
    const listing = store.listings.find((item) => item.propertyId === request.params.propertyId || item.id === request.params.propertyId);
    if (!listing) { response.status(404).json({ error: "Listing not found" }); return; }
    response.json({ ...listing, property: store.properties.find((property) => property.id === listing.propertyId), mode: "demo-data" });
  });
  app.get("/api/listing/:propertyId", (request, response) => {
    const listing = store.listings.find((item) => item.propertyId === request.params.propertyId || item.id === request.params.propertyId);
    if (!listing) { response.status(404).json({ error: "Listing not found" }); return; }
    response.json({ ...listing, property: store.properties.find((property) => property.id === listing.propertyId), mode: "demo-data" });
  });

  const listingEditPreview = (request: Request, response: Response) => {
    const listing = store.listings.find((item) => item.propertyId === request.params.propertyId || item.id === request.params.propertyId);
    if (!listing) { response.status(404).json({ error: "Listing not found" }); return; }
    const entries = Object.entries(request.body ?? {}).filter(([field, value]) => ["title", "description", "checkInTime", "checkOutTime"].includes(field) && typeof value === "string" && value.trim());
    if (entries.length !== 1) { response.status(400).json({ error: "Provide one listing field to preview." }); return; }
    const [field, rawValue] = entries[0]!;
    const value = String(rawValue);
    const fieldLabel = field === "checkInTime" ? "Check-in time" : field === "checkOutTime" ? "Check-out time" : field === "title" ? "Title" : "Description";
    const before = String(listing[field as "title" | "description" | "checkInTime" | "checkOutTime"]);
    const approval = store.transaction(() => store.createListingApproval(store.properties.find((property) => property.id === listing.propertyId) ?? { id: listing.propertyId, name: listing.title, channel: "Airbnb", status: "available", nextStay: "", syncStatus: "healthy" }, fieldLabel, value));
    response.status(201).json({ approval, preview: { field, before, after: value }, mode: "demo-preview" });
  };
  app.patch("/api/listings/:propertyId", listingEditPreview);
  app.post("/api/listings/:propertyId/edit-preview", listingEditPreview);

  app.get("/api/calendar", (request, response) => {
    const propertyId = typeof request.query.propertyId === "string" ? request.query.propertyId : undefined;
    const from = typeof request.query.from === "string" ? request.query.from : dateParam(0);
    const to = typeof request.query.to === "string" ? request.query.to : dateParam(30);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) { response.status(400).json({ error: "Use a valid from/to date range." }); return; }
    response.json({ data: store.getCalendar(propertyId, from, to), from, to, mode: "demo-data" });
  });
  app.get("/api/calendar/availability", (request, response) => {
    const propertyId = typeof request.query.propertyId === "string" ? request.query.propertyId : undefined;
    const from = typeof request.query.from === "string" ? request.query.from : dateParam(0);
    const to = typeof request.query.to === "string" ? request.query.to : dateParam(30);
    response.json({ data: store.getCalendar(propertyId, from, to), from, to, mode: "demo-data" });
  });
  app.get("/api/calendar/rate-preview", (request, response) => {
    const propertyId = typeof request.query.propertyId === "string" ? request.query.propertyId : "prop_sandton";
    const from = typeof request.query.from === "string" ? request.query.from : dateParam(0);
    const to = typeof request.query.to === "string" ? request.query.to : dateParam(3);
    const preview = store.getRatePreview(propertyId, from, to);
    if (!preview) { response.status(400).json({ error: "Provide a valid listing and date range." }); return; }
    response.json({ ...preview, mode: "demo-preview" });
  });
  app.post("/api/calendar/preview", (request, response) => {
    const { propertyId, from, to, kind } = request.body ?? {};
    const action = store.transaction(() => store.createCalendarPreview(propertyId, from, to, kind === "unblock" ? "unblock" : "block"));
    if (!action) { response.status(400).json({ error: "Provide a listing and valid date range." }); return; }
    response.status(201).json({ action, mode: "demo-preview" });
  });

  app.get("/api/insights", (_request, response) => response.json({ data: store.insights, mode: "demo-data" }));
  app.get("/api/insights/:insightId", (request, response) => {
    const insight = store.insights.find((item) => item.id === request.params.insightId);
    if (!insight) { response.status(404).json({ error: "Insight not found" }); return; }
    response.json({ ...insight, mode: "demo-data" });
  });
  app.post("/api/insights/:insightId/optimise", (request, response) => {
    const action = store.transaction(() => store.createPricingPreview(request.params.insightId));
    if (!action) { response.status(404).json({ error: "Insight not found" }); return; }
    response.status(201).json({ action, mode: "demo-preview" });
  });

  app.get("/api/preview-actions", (_request, response) => response.json({ data: store.previewActions, mode: "demo-preview" }));
  app.post("/api/preview-actions/:actionId/decision", (request, response) => {
    const decision = request.body?.decision;
    if (decision !== "approved" && decision !== "rejected") { response.status(400).json({ error: "Decision must be approved or rejected" }); return; }
    const action = store.transaction(() => store.decidePreviewAction(request.params.actionId, decision));
    if (!action) { response.status(404).json({ error: "Pending preview action not found" }); return; }
    response.json(action);
  });

  app.post("/api/tasks/:taskId/complete", (request, response) => {
    const task = store.transaction(() => store.completeTask(request.params.taskId));
    if (!task) {
      response.status(404).json({ error: "Task not found" });
      return;
    }
    response.json(task);
  });

  app.post("/api/approvals/:approvalId/decision", (request, response) => {
    const decision = request.body?.decision;
    if (decision !== "approved" && decision !== "rejected") {
      response.status(400).json({ error: "Decision must be approved or rejected" });
      return;
    }
    const approval = store.transaction(() => store.decideApproval(request.params.approvalId, decision));
    if (!approval) {
      response.status(404).json({ error: "Pending approval not found" });
      return;
    }
    response.json(approval);
  });

  app.post("/api/activity/:activityId/retry", (request, response) => {
    const activity = store.transaction(() => store.retryActivity(request.params.activityId));
    if (!activity) {
      response.status(404).json({ error: "Retryable activity not found" });
      return;
    }
    response.json(activity);
  });

  return { app, store, flushReplies };
}
