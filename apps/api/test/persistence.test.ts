import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHmac } from "node:crypto";
import request from "supertest";
import { SqliteStore } from "../src/store/sqlite-store.js";
import { createApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const config = loadConfig({ NODE_ENV: "test", HOST_API_TOKEN: "a-test-administrator-token-32-characters",
  HOST_WHATSAPP_NUMBERS: "27110000000", META_APP_SECRET: "test-signing-secret" });
const admin = `Bearer ${config.HOST_API_TOKEN}`;

test("shared state, pairing sessions and command receipts survive restart", async () => {
  const directory = mkdtempSync(join(tmpdir(), "virtuhost-restart-"));
  const filename = join(directory, "test.sqlite");
  let store = new SqliteStore(filename);
  try {
    let { app } = createApp(config, { store });
    const pairing = await request(app).post("/api/devices/pairing").set("Authorization", admin);
    const session = await request(app).post("/auth/pair").send({ code: pairing.body.code });
    assert.equal(session.status, 200);
    const device = `Bearer ${session.body.token}`;
    assert.equal((await request(app).post("/auth/pair").send({ code: pairing.body.code })).status, 401);
    assert.equal((await request(app).post("/api/devices/pairing").set("Authorization", device)).status, 403);
    const command = await request(app).post("/api/demo/command").set("Authorization", admin)
      .send({ text: "Description for Sandton Studio: Updated through host chat." });
    assert.equal(command.status, 200);
    const snapshot = await request(app).get("/api/snapshot").set("Authorization", device);
    const proposal = snapshot.body.approvals[0];
    assert.equal(proposal.after, "Updated through host chat.");
    assert.equal((await request(app).post(`/api/approvals/${proposal.id}/decision`).set("Authorization", device).send({ decision: "approved" })).status, 200);
    await request(app).post("/api/tasks/task_clean_sandton/complete").set("Authorization", device);
    store.close();
    store = new SqliteStore(filename);
    ({ app } = createApp(config, { store }));
    const restored = await request(app).get("/api/snapshot").set("Authorization", device);
    assert.equal(restored.status, 200);
    assert.equal(restored.body.approvals.find((item: { id: string }) => item.id === proposal.id).status, "approved");
    assert.equal(restored.body.tasks[0].status, "completed");
    assert.match(restored.body.dashboard.briefing, /0 overdue/);
    assert.equal((await request(app).delete("/api/session").set("Authorization", device)).status, 204);
    assert.equal((await request(app).get("/api/snapshot").set("Authorization", device)).status, 401);
  } finally { store.close(); rmSync(directory, { recursive: true, force: true }); }
});

test("failed WhatsApp delivery survives restart without replaying the mutation", async () => {
  const directory = mkdtempSync(join(tmpdir(), "virtuhost-outbox-"));
  const filename = join(directory, "test.sqlite");
  let store = new SqliteStore(filename);
  const payload = JSON.stringify({ object: "whatsapp_business_account", entry: [{ changes: [{ field: "messages", value: {
    messages: [{ id: "persistent-message", from: "27110000000", timestamp: "1", type: "image", image: { id: "media-123", caption: "Rosebank Loft" } }],
  } }] }] });
  const signature = `sha256=${createHmac("sha256", config.META_APP_SECRET!).update(payload).digest("hex")}`;
  try {
    let { app } = createApp(config, { store, transport: { async sendText() { throw new Error("network unavailable"); } } });
    const post = () => request(app).post("/webhooks/whatsapp").set("content-type", "application/json").set("x-hub-signature-256", signature).send(payload);
    assert.equal((await post()).status, 503);
    const count = store.approvals.length;
    store.close(); store = new SqliteStore(filename);
    let deliveries = 0;
    ({ app } = createApp(config, { store, transport: { async sendText() { deliveries++; } } }));
    assert.equal((await post()).status, 200);
    assert.equal((await post()).status, 200);
    assert.equal(deliveries, 1);
    assert.equal(store.approvals.length, count);
  } finally { store.close(); rmSync(directory, { recursive: true, force: true }); }
});

test("a failed transaction rolls back both proposal and command receipt", () => {
  const store = new SqliteStore();
  try {
    const before = store.approvals.length;
    assert.throws(() => store.prepareReply("broken", "27110000000", () => {
      store.createListingApproval(store.properties[0]!, "Description", "should roll back");
      throw new Error("simulate database operation failure");
    }));
    assert.equal(store.approvals.length, before);
    assert.equal(store.pendingReplies().length, 0);
  } finally { store.close(); }
});

test("two connections serialize updates instead of overwriting other changes", () => {
  const directory = mkdtempSync(join(tmpdir(), "virtuhost-connections-"));
  const first = new SqliteStore(join(directory, "test.sqlite"));
  const second = new SqliteStore(join(directory, "test.sqlite"));
  try {
    first.transaction(() => first.completeTask("task_clean_sandton"));
    second.transaction(() => second.completeTask("task_keys_rosebank"));
    first.reload();
    assert.ok(first.tasks.every((task) => task.status === "completed"));
  } finally { first.close(); second.close(); rmSync(directory, { recursive: true, force: true }); }
});

test("pairing attempts are throttled and a pending reply is leased to one worker", async () => {
  const store = new SqliteStore();
  try {
    const { app } = createApp(config, { store });
    for (let i = 0; i < 10; i++) await request(app).post("/auth/pair").send({ code: "0".repeat(32) });
    assert.equal((await request(app).post("/auth/pair").send({ code: "0".repeat(32) })).status, 429);
    store.prepareReply("lease", "27110000000", () => "hello");
    assert.ok(store.claimReply("lease"));
    assert.equal(store.claimReply("lease"), undefined);
    store.finishReply("lease", true);
    assert.equal(store.claimReply("lease"), undefined);
  } finally { store.close(); }
});

test("recovery worker delivers a committed reply and stops at the retry limit", async () => {
  const store = new SqliteStore();
  try {
    store.prepareReply("recovery", "27110000000", () => "Saved reply");
    let delivered = "";
    const { flushReplies } = createApp(config, { store, transport: { async sendText(_to, body) { delivered = body; } } });
    await flushReplies();
    assert.equal(delivered, "Saved reply");
    assert.ok(store.replyDelivered("recovery"));
    store.prepareReply("exhausted", "27110000000", () => "Needs attention");
    for (let i = 0; i < 5; i++) { assert.ok(store.claimReply("exhausted")); store.finishReply("exhausted", false); }
    assert.equal(store.claimReply("exhausted"), undefined);
    assert.equal(store.deliverySummary()?.needsAttention, 1);
  } finally { store.close(); }
});
