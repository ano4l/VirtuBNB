import { createHmac } from "node:crypto";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import type { AppConfig } from "../src/config.js";
import { loadConfig } from "../src/config.js";
import type { WhatsAppTransport } from "../src/whatsapp/transport.js";

class RecordingTransport implements WhatsAppTransport {
  readonly sent: Array<{ to: string; body: string }> = [];

  async sendText(to: string, body: string): Promise<void> {
    this.sent.push({ to, body });
  }
}

const config: AppConfig = {
  NODE_ENV: "test",
  PORT: 4100,
  WHATSAPP_VERIFY_TOKEN: "test-verify-token",
  WHATSAPP_TRANSPORT: "demo",
  META_APP_SECRET: "test-app-secret",
  HOST_API_TOKEN: "test-host-token-with-at-least-24-characters",
  HOST_WHATSAPP_NUMBERS: "27110000000",
};

function messagePayload(message: Record<string, unknown>) {
  return {
    object: "whatsapp_business_account",
    entry: [{ changes: [{ field: "messages", value: { messages: [message] } }] }],
  };
}

function sign(body: string) {
  return `sha256=${createHmac("sha256", config.META_APP_SECRET!).update(body).digest("hex")}`;
}

describe("VirtuHost API", () => {
  it("accepts blank optional demo settings and requires credentials for cloud mode", () => {
    assert.equal(loadConfig({ WHATSAPP_GRAPH_API_VERSION: "", HOST_API_TOKEN: "" }).WHATSAPP_TRANSPORT, "demo");
    assert.throws(() => loadConfig({ WHATSAPP_TRANSPORT: "cloud" }));
    assert.throws(() => loadConfig({ NODE_ENV: "production" }));
  });
  it("completes Meta webhook verification", async () => {
    const { app } = createApp(config, { transport: new RecordingTransport() });
    const response = await request(app).get(
      "/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=challenge-123",
    );
    assert.equal(response.status, 200);
    assert.equal(response.text, "challenge-123");
  });

  it("rejects an invalid webhook signature", async () => {
    const { app } = createApp(config, { transport: new RecordingTransport() });
    const response = await request(app)
      .post("/webhooks/whatsapp")
      .set("content-type", "application/json")
      .set("x-hub-signature-256", "sha256=bad")
      .send(JSON.stringify(messagePayload({ id: "wamid.1", from: "27110000000", type: "text", text: { body: "today" } })));
    assert.equal(response.status, 401);
  });

  it("answers a TODAY command once when the webhook is retried", async () => {
    const transport = new RecordingTransport();
    const { app } = createApp(config, { transport });
    const payload = JSON.stringify(
      messagePayload({
        id: "wamid.today",
        from: "27110000000",
        timestamp: "1788720000",
        type: "text",
        text: { body: "TODAY" },
      }),
    );

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await request(app)
        .post("/webhooks/whatsapp")
        .set("content-type", "application/json")
        .set("x-hub-signature-256", sign(payload))
        .send(payload);
      assert.equal(response.status, 200);
    }

    assert.equal(transport.sent.length, 1);
    assert.match(transport.sent[0]?.body ?? "", /two arrivals/i);
  });

  it("stages an image as a property photo approval", async () => {
    const transport = new RecordingTransport();
    const { app, store } = createApp(config, { transport });
    const payload = JSON.stringify(
      messagePayload({
        id: "wamid.photo",
        from: "27110000000",
        timestamp: "1788720001",
        type: "image",
        image: { id: "media_rosebank_123", caption: "Rosebank Loft cover photo" },
      }),
    );

    const response = await request(app)
      .post("/webhooks/whatsapp")
      .set("content-type", "application/json")
      .set("x-hub-signature-256", sign(payload))
      .send(payload);

    assert.equal(response.status, 200);
    assert.equal(store.approvals[0]?.kind, "listing_photo");
    assert.match(transport.sent[0]?.body ?? "", /no live listing changes before approval/i);
  });

  it("records mobile approval decisions without claiming a live update", async () => {
    const { app } = createApp(config, { transport: new RecordingTransport() });
    const response = await request(app)
      .post("/api/approvals/approval_checkin/decision")
      .set("authorization", `Bearer ${config.HOST_API_TOKEN}`)
      .send({ decision: "approved" });
    assert.equal(response.status, 200);
    assert.equal(response.body.status, "approved");
  });

  it("blocks unauthenticated API reads and writes", async () => {
    const { app } = createApp(config);
    assert.equal((await request(app).get("/api/properties")).status, 401);
    assert.equal((await request(app).post("/api/tasks/task_clean_sandton/complete")).status, 401);
  });

  it("ignores signed messages from unknown senders", async () => {
    const transport = new RecordingTransport();
    const { app, store } = createApp(config, { transport });
    const body = JSON.stringify(messagePayload({ id: "unknown", from: "27999999999", timestamp: "1", type: "text", text: { body: "APPROVE VH-1842" } }));
    assert.equal((await request(app).post("/webhooks/whatsapp").set("content-type", "application/json").set("x-hub-signature-256", sign(body)).send(body)).status, 200);
    assert.equal(store.approvals[0]?.status, "pending");
    assert.equal(transport.sent.length, 0);
  });

  it("rejects malformed signatures without throwing and rejects malformed envelopes", async () => {
    const { app } = createApp(config);
    const body = "null";
    assert.equal((await request(app).post("/webhooks/whatsapp").set("content-type", "application/json").set("x-hub-signature-256", `sha256=${"z".repeat(64)}`).send(body)).status, 401);
    assert.equal((await request(app).post("/webhooks/whatsapp").set("content-type", "application/json").set("x-hub-signature-256", sign(body)).send(body)).status, 400);
  });

  it("retries failed delivery without creating another proposal", async () => {
    let attempts = 0;
    const { app, store } = createApp(config, { transport: { async sendText() { if (++attempts === 1) throw new Error("temporary"); } } });
    const body = JSON.stringify(messagePayload({ id: "retry", from: "27110000000", timestamp: "1", type: "image", image: { id: "media", caption: "Rosebank Loft" } }));
    const post = () => request(app).post("/webhooks/whatsapp").set("content-type", "application/json").set("x-hub-signature-256", sign(body)).send(body);
    assert.equal((await post()).status, 503);
    assert.equal((await post()).status, 200);
    assert.equal(store.approvals.length, 2);
    assert.equal(attempts, 2);
  });

  it("runs listing and task commands through the authenticated chat API", async () => {
    const { app, store } = createApp(config);
    const command = (text: string) => request(app).post("/api/demo/command").set("authorization", `Bearer ${config.HOST_API_TOKEN}`).send({ text });
    await command("Change Rosebank Loft check-in to 15:00");
    const proposal = store.approvals[0]!;
    assert.equal(proposal.after, "15:00");
    await command(`APPROVE ${proposal.code}`);
    assert.equal(store.approvals.find((item) => item.id === proposal.id)?.status, "approved");
    await command("COMPLETE task_clean_sandton");
    assert.match((await command("TODAY")).body.reply, /0 overdue/);
    const count = store.approvals.length;
    await command("Change Rosebank Loft check-in to 25:00");
    await command("Change Rosebank Loft and Sandton Studio check-in to 15:00");
    assert.equal(store.approvals.length, count);
  });

  it("refuses expired and already-decided approvals", () => {
    const { store } = createApp(config);
    const proposal = store.approvals[0]!;
    proposal.expiresAt = new Date(Date.now() - 1000).toISOString();
    assert.equal(store.decideApproval(proposal.code, "approved"), undefined);
    proposal.expiresAt = new Date(Date.now() + 10000).toISOString();
    assert.equal(store.decideApproval(proposal.code, "rejected")?.status, "rejected");
    assert.equal(store.decideApproval(proposal.code, "approved"), undefined);
  });
});
