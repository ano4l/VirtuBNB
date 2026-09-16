# VirtuHost NextPax Build Plan

## Outcome

Build VirtuHost as a provider-neutral, WhatsApp-first PMS and AI operations layer, with NextPax behind a dedicated adapter. The first production-shaped vertical slice must accept a provider event once, create canonical reservation history and operational work, prepare an approved outbound action, receive provider confirmation, notify the host, and retain a complete audit trail.

Live NextPax endpoint paths and payload mappings remain disabled until the private Developer Portal specification and sandbox credentials are available. Synthetic fixtures and a fake adapter will prove the architecture without claiming live connectivity.

## Architecture rules

1. WhatsApp is the host/team control surface; OTA guest messages travel through NextPax.
2. The AI may retrieve context and create typed proposals; it never calls NextPax or mutates authoritative state directly.
3. Permissions, property resolution, money, dates, approval requirements, idempotency, dispatch and confirmation are deterministic.
4. An accepted job or HTTP 2xx response is not completion. Provider confirmation or reconciliation is required.
5. Provider-specific fields remain inside `integrations/nextpax`; application services use canonical contracts.
6. SQLite and seeded stores remain supported for demo/test mode. Production persistence moves to PostgreSQL through repository interfaces.
7. Every incoming event and outgoing command has an organization, connection, correlation ID and idempotency key.

## Phase 1 — Provider-neutral foundation

- Add integration capabilities, canonical commands, dispatch results and stable provider errors.
- Add a provider registry and deterministic fake adapter.
- Add typed AI proposal schemas and policy decisions.
- Add inbox, outbox, confirmation and audit state models.
- Remove Airbnb-only assumptions from new integration code while preserving existing demo compatibility.
- Add contract and safety tests.

Critical paths:

- `apps/api/src/integrations/contracts.ts`
- `apps/api/src/integrations/capabilities.ts`
- `apps/api/src/integrations/errors.ts`
- `apps/api/src/integrations/registry.ts`
- `apps/api/src/integrations/fake/fake-adapter.ts`
- `apps/api/src/ai/proposal-schema.ts`
- `apps/api/src/policy/action-policy.ts`
- `apps/api/src/workflows/types.ts`
- `apps/api/src/domain/types.ts`

## Phase 2 — Durable event and command flow

- Introduce repository interfaces for organizations, connections, mappings, reservations, revisions, messages, tasks, proposals, approvals, inbound events, outbound commands, confirmations and audit events.
- Add PostgreSQL migrations and implementation; retain SQLite only as a demo adapter.
- Implement a raw provider webhook inbox with durable acceptance, authentication hooks, deduplication, leases, retries and quarantine.
- Implement a transactional outbox, dispatch attempts, dead-letter state and reconciliation jobs.
- Add a fake NextPax webhook route and end-to-end fixture flow.

Critical paths:

- `apps/api/src/repositories/`
- `apps/api/src/db/`
- `apps/api/migrations/`
- `apps/api/src/integrations/webhooks/`
- `apps/api/src/integrations/outbox.ts`
- `apps/api/src/integrations/reconciliation.ts`
- `apps/api/src/jobs/`
- `apps/api/src/app.ts`
- `apps/api/src/server.ts`

## Phase 3 — First complete operational slice

Implement:

```text
provider booking event
  -> durable inbox
  -> canonical reservation + immutable revision
  -> exactly one turnover task
  -> exactly one WhatsApp host notification
  -> audit events
```

Then implement:

```text
host WhatsApp guest-reply request
  -> typed proposal
  -> deterministic policy
  -> expiring immutable approval
  -> outbox command
  -> fake NextPax dispatch
  -> provider confirmation/reconciliation
  -> audited WhatsApp result
```

## Phase 4 — AI orchestration

- Replace regex-only command handling with an orchestrator while preserving deterministic fallback commands.
- Use strict structured output for a small allowlist of read tools and proposal tools.
- Ground responses in organization-scoped repositories and property knowledge.
- Treat guest messages, listing content and attachments as untrusted data.
- Bind approvals to an immutable payload hash, actor and expiry.
- Add prompt-injection, malformed-tool, ambiguity and wrong-property tests.

Critical paths:

- `apps/api/src/agent/orchestrator.ts`
- `apps/api/src/agent/command-engine.ts`
- `apps/api/src/ai/llm-client.ts`
- `apps/api/src/ai/proposal-schema.ts`
- `apps/api/src/approvals/approval-service.ts`
- `apps/api/src/policy/`

## Phase 5 — Live NextPax sandbox

After access is received:

- Confirm authentication, base URLs, notification authentication and event identifiers.
- Replace synthetic payload mappers with schemas generated from or checked against official private documentation.
- Implement property/unit/channel mapping and portfolio import.
- Implement booking and message notifications plus polling recovery.
- Implement guest-message dispatch and confirmation first.
- Add rates, availability, restrictions, content, media, reviews and reservation changes incrementally behind capability flags.
- Complete NextPax certification and a controlled live-property pilot.

Do not guess endpoint paths, status mappings, media rules, payment behavior, rate limits or certification semantics before access.

## Phase 6 — Product completion

- Connect frontend surfaces to organization-scoped production APIs.
- Add onboarding, NextPax connection health, mapping, roles, workflow settings and audit search.
- Add WhatsApp interactive approvals, templates, media and delivery-status handling.
- Add cleaner/contractor task flows, issue escalation, daily briefings and owner reports.
- Add billing/entitlements and measured AI/WhatsApp usage.
- Conduct POPIA, security, operational-readiness and incident-response reviews.

## Verification gates

- Existing demo tests continue to pass.
- Empty-database migrations succeed and are repeatable.
- Duplicate provider events create one reservation revision, task and notification.
- Modifications and cancellations append history rather than overwrite it.
- Two organizations cannot access each other's data.
- Invalid webhook authentication and malformed payloads are rejected or quarantined safely.
- Outbox retries cannot duplicate guest messages or inventory changes.
- Expired, reused, altered and wrong-actor approvals fail.
- Provider confirmation, not queue acceptance, controls the success message.
- Prompt injection in guest content cannot authorize a tool or reveal secrets.
- Readiness reports database, queue and provider degradation separately.
- Production build, typecheck and all API tests pass.

## External prerequisites

- NextPax commercial acceptance and standard agreement.
- Developer Portal and sandbox credentials.
- Confirmed South African property/channel support and pricing.
- Official notification authentication and payload documentation.
- WhatsApp Business production account, approved number and templates.
- Managed PostgreSQL and production secrets platform.
- Legal/privacy review, data-processing terms and security assessment.
