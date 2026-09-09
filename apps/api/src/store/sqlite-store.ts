import { DatabaseSync } from "node:sqlite";
import { createHash, randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { MemoryStore } from "./memory-store.js";

type Snapshot = Pick<MemoryStore, "properties" | "tasks" | "approvals" | "activities" | "bookings" | "conversations" | "messages" | "listings" | "calendar" | "insights" | "previewActions">;
type Reply = { key: string; recipient: string; body: string; delivered: number; attempts: number; created: number; lease_until: number };
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

/** Single-workspace development repository. The snapshot and command receipt
 * commit together. A relational multi-tenant schema is a separate migration. */
export class SqliteStore extends MemoryStore {
  private readonly db: DatabaseSync;

  constructor(filename = ":memory:") {
    super();
    if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true });
    this.db = new DatabaseSync(filename);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS workspace (id INTEGER PRIMARY KEY CHECK(id=1), version INTEGER NOT NULL, data TEXT NOT NULL) STRICT;
      CREATE TABLE IF NOT EXISTS replies (key TEXT PRIMARY KEY, recipient TEXT NOT NULL, body TEXT NOT NULL,
        delivered INTEGER NOT NULL DEFAULT 0, attempts INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL,
        lease_until INTEGER NOT NULL DEFAULT 0, next_attempt INTEGER NOT NULL DEFAULT 0) STRICT;
      CREATE TABLE IF NOT EXISTS pairing (hash TEXT PRIMARY KEY, expires INTEGER NOT NULL) STRICT;
      CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, expires INTEGER NOT NULL) STRICT;`);
    this.db.prepare("INSERT OR IGNORE INTO workspace VALUES (1, 1, ?)").run(JSON.stringify(this.snapshot()));
    this.reload();
  }

  private snapshot(): Snapshot {
    return {
      properties: this.properties, tasks: this.tasks, approvals: this.approvals, activities: this.activities,
      bookings: this.bookings, conversations: this.conversations, messages: this.messages, listings: this.listings,
      calendar: this.calendar, insights: this.insights, previewActions: this.previewActions,
    };
  }

  reload() {
    const row = this.db.prepare("SELECT version, data FROM workspace WHERE id=1").get();
    if (!row || row.version !== 1) throw new Error("Unsupported workspace schema");
    const data = JSON.parse(String(row.data)) as Snapshot;
    for (const name of ["properties", "tasks", "approvals", "activities", "bookings", "conversations", "messages", "listings", "calendar", "insights", "previewActions"] as const) {
      // Older workspace snapshots predate the demo booking domain. Keep the
      // freshly seeded values for absent fields and migrate them on next write.
      if (data[name] === undefined) continue;
      if (!Array.isArray(data[name])) throw new Error("Invalid workspace data");
      // Keep array identities stable for command engine references.
      (this[name] as unknown[]).splice(0, this[name].length, ...data[name]);
    }
  }

  transaction<T>(action: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.reload();
      const result = action();
      if (result instanceof Promise) throw new Error("Repository transactions must be synchronous");
      this.db.prepare("UPDATE workspace SET data=? WHERE id=1").run(JSON.stringify(this.snapshot()));
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      this.reload();
      throw error;
    }
  }

  prepareReply(key: string, recipient: string, execute: () => string): Reply {
    return this.transaction(() => {
      const existing = this.db.prepare("SELECT * FROM replies WHERE key=?").get(key) as Reply | undefined;
      if (existing) return existing;
      const body = execute();
      const created = Date.now();
      this.db.prepare("INSERT INTO replies (key,recipient,body,created) VALUES (?,?,?,?)").run(key, recipient, body, created);
      return { key, recipient, body, created, delivered: 0, attempts: 0, lease_until: 0 };
    });
  }

  claimReply(key: string): Reply | undefined {
    return this.db.prepare(`UPDATE replies SET lease_until=?, attempts=attempts+1
      WHERE key=? AND delivered=0 AND attempts<5 AND lease_until<=? AND created>?
      RETURNING *`).get(Date.now() + 30000, key, Date.now(), Date.now() - 23 * 3600000) as Reply | undefined;
  }

  finishReply(key: string, delivered: boolean) {
    this.db.prepare("UPDATE replies SET delivered=?, lease_until=0, next_attempt=? WHERE key=?")
      .run(delivered ? 1 : 0, Date.now() + 30000, key);
  }

  pendingReplies(): Reply[] {
    return this.db.prepare(`SELECT * FROM replies WHERE delivered=0 AND attempts<5 AND lease_until<=?
      AND next_attempt<=? AND created>? LIMIT 20`).all(Date.now(), Date.now(), Date.now() - 23 * 3600000) as Reply[];
  }

  replyDelivered(key: string) {
    return this.db.prepare("SELECT delivered FROM replies WHERE key=?").get(key)?.delivered === 1;
  }

  deliverySummary() {
    return this.db.prepare(`SELECT COUNT(*) AS pending,
      COALESCE(SUM(CASE WHEN attempts>=5 OR created<=? THEN 1 ELSE 0 END),0) AS needsAttention
      FROM replies WHERE delivered=0`).get(Date.now() - 23 * 3600000);
  }

  createPairing() {
    const code = randomBytes(16).toString("hex");
    const expires = Date.now() + 5 * 60000;
    this.db.prepare("DELETE FROM pairing WHERE expires<=?").run(Date.now());
    this.db.prepare("INSERT INTO pairing VALUES (?,?)").run(hash(code), expires);
    return { code, expiresAt: new Date(expires).toISOString() };
  }

  redeemPairing(code: string) {
    return this.transaction(() => {
      const row = this.db.prepare("DELETE FROM pairing WHERE hash=? AND expires>? RETURNING hash").get(hash(code), Date.now());
      if (!row) return undefined;
      const token = randomBytes(32).toString("hex");
      const expires = Date.now() + 8 * 3600000;
      this.db.prepare("DELETE FROM sessions WHERE expires<=?").run(Date.now());
      this.db.prepare("INSERT INTO sessions VALUES (?,?)").run(hash(token), expires);
      return { token, expiresAt: new Date(expires).toISOString() };
    });
  }

  validSession(token: string) {
    return Boolean(this.db.prepare("SELECT hash FROM sessions WHERE hash=? AND expires>?").get(hash(token), Date.now()));
  }

  revokeSession(token: string) { this.db.prepare("DELETE FROM sessions WHERE hash=?").run(hash(token)); }
  close() { this.db.close(); }
}
