import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const config = loadConfig({ NODE_ENV: "test", HOST_API_TOKEN: "demo-domain-test-token-32-characters", HOST_WHATSAPP_NUMBERS: "27110000000" });
const auth = { authorization: `Bearer ${config.HOST_API_TOKEN}` };
const stores: Array<{ close: () => void }> = [];
afterEach(() => { for (const store of stores.splice(0)) store.close(); });

function app() {
  const result = createApp(config);
  stores.push(result.store);
  return result.app;
}

describe("actual-app demo domain", () => {
  it("hydrates the frontend snapshot with bookings, conversations, listings, calendar and insights", async () => {
    const response = await request(app()).get("/api/snapshot").set(auth);
    assert.equal(response.status, 200);
    assert.ok(response.body.bookings.some((item: { id: string }) => item.id === "booking_sarah"));
    assert.ok(response.body.conversations.some((item: { id: string }) => item.id === "conversation_sarah"));
    assert.ok(response.body.listings.some((item: { id: string }) => item.id === "listing_sandton"));
    assert.ok(response.body.calendar.length > 0);
    assert.ok(response.body.insights.length > 0);
    assert.deepEqual(response.body.mode, "demo-data");
  });

  it("supports booking filters, details and safe booking action previews", async () => {
    const server = app();
    const filtered = await request(server).get("/api/bookings?status=confirmed").set(auth);
    assert.equal(filtered.status, 200);
    assert.ok(filtered.body.data.every((item: { status: string }) => item.status === "confirmed"));
    const detail = await request(server).get("/api/bookings/booking_sarah").set(auth);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.guestName, "Sarah Mitchell");
    const action = await request(server).post("/api/bookings/booking_sarah/action").set(auth).send({ action: "check-in-details" });
    assert.equal(action.status, 201);
    assert.equal(action.body.status, "pending");
    assert.match(action.body.summary, /no provider was contacted/i);
  });

  it("creates a reviewable guest reply without sending it", async () => {
    const server = app();
    const conversation = await request(server).get("/api/conversations/conversation_sarah").set(auth);
    assert.equal(conversation.status, 200);
    assert.equal(conversation.body.messages.length, 2);
    const preview = await request(server).post("/api/conversations/conversation_sarah/reply-preview").set(auth).send({ body: "I can offer 13:00 if the apartment is ready." });
    assert.equal(preview.status, 201);
    assert.equal(preview.body.message.status, "preview");
    assert.match(preview.body.action.summary, /not been sent/i);
    const decided = await request(server).post(`/api/preview-actions/${preview.body.action.id}/decision`).set(auth).send({ decision: "approved" });
    assert.equal(decided.status, 200);
    assert.equal(decided.body.status, "approved");
  });

  it("stages listing, calendar and pricing changes as explicit previews", async () => {
    const server = app();
    const listing = await request(server).get("/api/listings/prop_sandton").set(auth);
    assert.equal(listing.status, 200);
    const edit = await request(server).patch("/api/listings/prop_sandton").set(auth).send({ description: "A revised demo description." });
    assert.equal(edit.status, 201);
    assert.equal(edit.body.preview.before, listing.body.description);
    const availability = await request(server).get("/api/calendar/availability?propertyId=prop_sandton").set(auth);
    assert.equal(availability.status, 200);
    assert.ok(availability.body.data.length > 0);
    const rates = await request(server).get("/api/calendar/rate-preview?propertyId=prop_sandton&from=2026-09-11&to=2026-09-14").set(auth);
    assert.equal(rates.status, 200);
    assert.equal(rates.body.nights, 3);
    const calendar = await request(server).post("/api/calendar/preview").set(auth).send({ propertyId: "prop_sandton", from: "2026-09-20", to: "2026-09-22" });
    assert.equal(calendar.status, 201);
    assert.equal(calendar.body.action.kind, "calendar_update");
    const insight = await request(server).post("/api/insights/insight_weekend_rates/optimise").set(auth);
    assert.equal(insight.status, 201);
    assert.equal(insight.body.action.kind, "pricing_update");
  });
});
