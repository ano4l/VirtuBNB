import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { fileURLToPath } from "node:url";

// Ephemeral local token stays in this process; no customer or Meta data is used.
const token = randomBytes(32).toString("hex");
const config = loadConfig({ NODE_ENV: "development", HOST_API_TOKEN: token,
  DATABASE_PATH: process.env.DATABASE_PATH ?? fileURLToPath(new URL("../../../data/virtuhost.sqlite", import.meta.url)) });
const { app, store } = createApp(config);
const server = app.listen(config.PORT, "127.0.0.1");
await new Promise<void>((resolve) => server.once("listening", resolve));
const address = server.address();
if (!address || typeof address === "string") throw new Error("Local server did not start");
const terminal = createInterface({ input: stdin, output: stdout });
console.log(`VirtuHost shared chat at http://127.0.0.1:${address.port}. Data persists. Type PAIR to connect the host app, HELP or EXIT.`);
try {
  while (true) {
    const text = await terminal.question("You: ");
    if (text.trim().toLowerCase() === "exit") break;
    if (text.trim().toLowerCase() === "pair") {
      const result = store.createPairing();
      console.log(`Pairing code: ${result.code}\nValid until ${result.expiresAt}. Enter it under Connect workspace in the host app.`);
      continue;
    }
    const response = await fetch(`http://127.0.0.1:${address.port}/api/demo/command`, {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ text }),
    });
    const result = await response.json() as { reply?: string; error?: string };
    console.log(`VirtuHost: ${result.reply ?? result.error}\n`);
  }
} finally { terminal.close(); server.close(() => store.close()); }
