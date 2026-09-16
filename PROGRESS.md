# VirtuHost Build Progress

Last updated: 16 September 2026

## Product boundary

VirtuHost is being built as a responsive web control plane and WhatsApp
operator channel. It will use an isolated, authorized digital computer for
Airbnb only after written platform authorization, a scoped host grant, and
production security gates are in place. It does not use a PMS as its primary
product path.

No feature may claim that it changed Airbnb unless the execution record has a
fresh baseline, an approved action, browser evidence, an independent re-read,
and a verified result.

## Completed foundation

- [x] Responsive React/Vite web workspace, checked at phone and desktop widths.
- [x] Responsive Vercel frontend shell: desktop workbench rail, mobile
  thumb-reachable navigation, truthful unconnected state, static-hosting env
  template, and independently evaluated desktop/mobile accessibility checks.
- [x] Authenticated web API boundary and short-lived pairing sessions for the
  development control plane.
- [x] Meta webhook verification, payload validation, allowlisted host numbers,
  idempotent WhatsApp reply delivery, and retry leasing.
- [x] Typed, provider-neutral operation proposals and deterministic action
  policy: all consequential operations require approval.
- [x] GPT-5.6 Luna server-side planner boundary using structured output;
  untrusted model output is validated before policy evaluation.
- [x] One authenticated `/api/commands` route used by the web assistant, with
  persistent command/audit records and fail-closed planner behaviour.
- [x] Web service-readiness screen and agent-request audit trail, both driven
  by authenticated API state rather than static demo labels.
- [x] SQLite development persistence for workspace state, approvals, command
  receipts, pairing sessions, and queued reply delivery.
- [x] Provider adapter contract and fake adapter for automated tests.
- [x] Full production architecture and authorization research documented in
  `docs/implementation/` and `docs/research/`.

## In progress

- [ ] Replace seeded workspace records with a tenant-scoped Supabase Postgres
  repository and forward-only migrations. The first RLS migration is now in
  `supabase/migrations/`; it has not been applied to a project yet.
- [ ] Convert WhatsApp command handling into a durable inbound command queue
  and worker. The current reply outbox is durable; the planner work itself is
  still synchronous for recognised commands.
- [ ] Replace development pairing with production identity: organization,
  member roles, session rotation, MFA, device management, and audit access.

## Remaining delivery sequence

### 1. Secure control plane

- [ ] Supabase Postgres schema: organizations, members, grants, properties,
  approvals, workflows, audit events, outbox, inbox, and browser runs.
- [ ] Supabase Auth integration, MFA, redirect URLs, and database RLS tests.
- [ ] RBAC, scoped authorization grants, tenant isolation tests, encrypted
  secret references, retention/deletion controls, and kill switches.
- [ ] Production observability: structured logs, traces, metrics, alerts,
  health/readiness checks, backups, and disaster-recovery exercises.

### 2. Agent and cross-channel workflow

- [ ] Durable inbox/outbox worker with idempotency keys and dead-letter
  handling.
- [ ] WhatsApp templates, delivery status webhooks, opt-in/consent records,
  and approved-command links back to the web app.
- [ ] Proposal versioning, approval expiry/revocation, two-person controls for
  high-risk actions, and an immutable audit timeline.

### 3. Authorized Airbnb computer executor

- [ ] Obtain written Airbnb authorization and a versioned grant defining
  accounts, listings, permitted actions, volume, supervision, data handling,
  and rollback. This is a hard gate before live browser automation.
- [ ] Build isolated browser profiles, credential vault integration, network
  controls, write leases, takeover/kill controls, and evidence storage.
- [ ] Implement narrow adapter capabilities: fresh read, calendar block,
  listing-description update, verification re-read, and safe restoration.
- [ ] Add UI drift detection, confidence thresholds, screenshot/DOM evidence,
  reconciliation, and incident handling. Never bypass MFA, CAPTCHAs, or
  platform controls.

### 4. Evidence-ready pilot

- [ ] Run the authorised vertical slice: app calendar block -> WhatsApp
  approval -> browser execution -> independent verification -> confirmation in
  both channels -> restoration.
- [ ] Run the reciprocal listing-description flow from WhatsApp to app.
- [ ] Complete security review, accessibility/regression testing, load and
  failure tests, pilot runbook, and operator training.

## Current configuration state

| Component | Current state | Activation requirement |
| --- | --- | --- |
| Web control plane | Vercel-build ready | Set `VITE_API_URL`, then Supabase Auth/RLS and repository migration |
| WhatsApp transport | Cloud-capable, not configured | Meta credentials, verified webhook, approved sender scope |
| GPT-5.6 Luna planner | Implemented, fail-closed | Server-side `OPENAI_API_KEY` and `AI_PROVIDER=openai` |
| Airbnb executor | Intentionally not built/connected | Written authorization plus the security controls above |

## Verification baseline

Latest local verification:

- `pnpm --filter @virtuhost/api test` — 38 passing tests
- `pnpm --filter @virtuhost/api typecheck` — passing
- `pnpm --filter @virtuhost/web typecheck` — passing
- `pnpm --filter @virtuhost/web build` — passing
- Browser QA — 390 × 844 and desktop workspace, with no Axe WCAG 2 A/AA
  violations in the checked states

Update this document whenever a milestone changes state. A checkbox is only
complete once code, test evidence, and its operational/security conditions are
all present.
