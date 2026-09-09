# VirtuHost

VirtuHost is a WhatsApp-first operations platform for short-term-rental hosts. This repository contains the host web app, WhatsApp webhook service, and command engine.

## Structure

- `apps/api` receives official WhatsApp Business Platform webhooks, interprets core host commands, stages approvals, and exposes the mobile API.
- `Frontend` is the first-class React/Vite host app (`@virtuhost/web`), using the API through a same-origin development proxy.
- `PRD.md` defines the product requirements and phased integration strategy.

## Local setup

1. Copy `.env.example` to `.env` and keep `WHATSAPP_TRANSPORT=demo`.
2. Run `pnpm install`.
3. Run `pnpm dev` to start both the API and web app, or use `pnpm dev:api` / `pnpm dev:web` separately.

The web app runs at `http://127.0.0.1:5173` and forwards `/api`, `/auth`, and `/health` to the local API at `http://127.0.0.1:4100`. Set `VITE_API_PROXY_TARGET` only when the local API uses another address. `HOST_API_TOKEN` remains server-only and is never bundled into the browser.

The demo transport records reply metadata without contacting Meta or a real customer.

## Try the chat now

Run `pnpm demo:chat` from this folder. It starts an isolated loopback API with an ephemeral authentication token, and opens an interactive host chat. No configuration or provider account is needed.

Try these messages in order:

1. `TODAY`
2. `Change Rosebank Loft check-in to 15:00`
3. Copy the returned `APPROVE VH-...` command to confirm that specific proposal.
4. `TASKS`
5. `COMPLETE task_clean_sandton`
6. `TODAY` to see the overdue count update.
7. `EXIT`

Also supported: `Description for Rosebank Loft: A bright apartment near the Gautrain.`, `APPROVALS`, `REJECT VH-...`, `PROPERTIES`, and `HELP`. The parser currently recognizes these specific commands; a language-model service is not connected.

For direct API use, set `HOST_API_TOKEN` to a random value of at least 24 characters and send it as `Authorization: Bearer <token>`. All `/api` routes require authentication.

## Vercel deployment

The repository includes a root `vercel.json` configured for the React host app:

- Install command: `corepack enable && pnpm install --frozen-lockfile`
- Build command: `pnpm --filter @virtuhost/web build`
- Output directory: `Frontend/dist`

The deployed frontend uses the local demo snapshot when no API URL is configured. Set `VITE_API_URL` only when a hosted API is available.

## Live WhatsApp setup

Use an official Meta WhatsApp Business Platform application. Configure the webhook URL as `/webhooks/whatsapp`, set the shared verify token, subscribe to message events, and provide the access token, phone-number id, Graph API version, and Meta app secret. Set `WHATSAPP_TRANSPORT=cloud` only after those values are present.

Cloud mode also requires `META_APP_SECRET`, `HOST_API_TOKEN`, and `HOST_WHATSAPP_NUMBERS` (comma-separated international digits without a plus). Only messages from those configured host numbers can access the single demo workspace. Unknown senders are ignored. Signature verification is required for cloud mode. Use a development HTTPS tunnel to the loopback server for Meta webhook testing.

Failed replies return HTTP 503 so the provider can retry. Command receipts, reply leases, approvals and demo workspace state persist in the local SQLite store so a restart does not replay a committed mutation.

Listing and reservation data remain seeded. Photo messages record a media reference only; downloading, validation, preview, storage, and PMS publication are still outstanding. Approval records a decision and never publishes to Airbnb.

## Development limits and next milestone

- Single demo host workspace only; pairing sessions are implemented, but multi-tenant identity and account onboarding are not.
- The local SQLite store is durable for development; production migrations, backups and tenant isolation are not complete.
- Guest replies, calendar changes, listing edits and pricing optimisations are reviewable previews and do not contact Airbnb or another PMS.
- No production scheduled booking alerts or provider-backed inbox/outbox yet.
- Production startup is intentionally blocked until tenant isolation and durable processing exist.

Next milestone: account-scoped production storage and tenant isolation, then an approved PMS connection and a live Meta test-number conversation.
