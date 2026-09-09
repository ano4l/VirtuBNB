import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { fileURLToPath } from "node:url";

const config = loadConfig();
config.DATABASE_PATH ??= fileURLToPath(new URL("../../../data/virtuhost.sqlite", import.meta.url));
const { app, store, flushReplies } = createApp(config);

const server = app.listen(config.PORT, "127.0.0.1", () => {
  console.info(`VirtuHost API listening on http://localhost:${config.PORT}`);
  console.info(`WhatsApp transport: ${config.WHATSAPP_TRANSPORT}`);
});
let flushing = false;
const timer = setInterval(async () => {
  if (flushing) return;
  flushing = true;
  try { await flushReplies(); } catch { console.error("Reply recovery failed; will retry."); }
  finally { flushing = false; }
}, 5000);
const stop = () => { clearInterval(timer); server.close(() => { store.close(); process.exit(0); }); };
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
