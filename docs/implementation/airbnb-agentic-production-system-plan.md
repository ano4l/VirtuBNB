# VirtuHost Agentic Production System Build Plan

**Date:** 13 September 2026
**Status:** Recommended implementation plan
**Objective:** Build the complete secure, robust, and efficient VirtuHost system: real WhatsApp and web-app control surfaces, real AI planning, isolated digital computers operating authorized Airbnb accounts, deterministic policy and approvals, independently verified results, and production operations suitable for technical review by Airbnb.

## 1. Executive decision

VirtuHost will not launch through a PMS or channel manager. It will be an agentic operations platform with four distinct layers:

1. **Host experience:** WhatsApp as the primary command and notification surface; the web/mobile app for onboarding, approvals, live execution, configuration, and audit.
2. **Control plane:** identity, tenancy, intent resolution, policy, approvals, workflows, canonical property data, and audit.
3. **Computer execution plane:** isolated digital computers that operate the Airbnb host interface using task-scoped browser skills.
4. **Verification plane:** independent re-reading, evidence capture, reconciliation, and explicit `verified`, `uncertain`, or `failed` outcomes.

Airbnb remains the source of truth for its listings, calendars, reservations, and messages. VirtuHost is the source of truth for intent, authority, workflow state, evidence, and operational history.

The system must demonstrate actual functionality. Its production journey is:

```text
Host instruction in app or WhatsApp
             |
       typed proposal
             |
 current Airbnb baseline + deterministic policy
             |
   approval in app or WhatsApp
             |
 durable workflow + isolated digital computer
             |
     real Airbnb operation
             |
 independent Airbnb re-read and verification
             |
 confirmed result in app and WhatsApp
```

The previous NextPax plan is not the implementation route for this version of VirtuHost. Its provider-neutral contracts, typed proposals, approval boundary, outbox, audit, and reconciliation principles remain reusable. The browser executor becomes the first real provider adapter.

## 2. Programme outcome and boundaries

### Production outcome

A host or authorized team member can:

- connect an Airbnb account without giving VirtuHost their password;
- map the listings they authorize VirtuHost to manage;
- ask questions about live listing, calendar, reservation, and inbox state;
- request calendar, pricing, listing, photo, messaging, review, and reservation operations;
- review exact before-and-after proposals in WhatsApp or the app;
- watch or take over the digital computer;
- receive a verified result with evidence and rollback guidance;
- configure bounded automations for routine work;
- pause an action, listing, account, or the entire automation service;
- see a complete, immutable operational history.

### Non-negotiable boundaries

- Live browser automation is enabled only for accounts and actions covered by documented Airbnb authorization or another written basis approved by counsel.
- Never collect or log Airbnb passwords, passkeys, one-time codes, PINs, security answers, or CAPTCHA responses.
- Never bypass platform protections, solve CAPTCHAs automatically, call undocumented Airbnb endpoints, reverse engineer private APIs, or use bot-evasion techniques.
- Guest messages, reviews, listing content, attachments, and web pages are untrusted data, never instructions.
- The AI does not decide permissions, approval requirements, authoritative money, dates, idempotency, execution success, or retry safety.
- A click, save toast, navigation, job acceptance, or message API acceptance is not completion.
- Critical financial, security, identity, payout, dispute, cancellation, and destructive actions require human control or remain prohibited.
- No fake, seeded, or cached state may be displayed as current live Airbnb state.

## 3. Airbnb engagement prerequisite

Because Airbnb has asked to see the technology, convert that request into a written technical-evaluation scope before connecting the system:

- designated Airbnb account and listing IDs;
- listing-owner authorization;
- permitted read and write operations;
- permitted session frequency and operating window;
- treatment of guest personal information;
- named Airbnb technical and security contacts;
- expected evidence, architecture, and security materials;
- restoration/rollback authority;
- escalation route for account challenge, UI change, or unexpected platform behaviour.

This scope becomes a versioned `AuthorizationGrant` in VirtuHost. The policy engine denies any listing, action, field, or date range outside that grant. An invitation to present the product must not be treated as unlimited authorization.

## 4. System architecture

```text
                           +----------------------+
                           |  WhatsApp Business   |
                           +----------+-----------+
                                      |
                              signed webhooks
                                      |
+----------------+          +---------v----------+          +------------------+
| VirtuHost App  +----------> API / Control Plane +----------> Event stream     |
| web + mobile   | commands |                    | status   | app + WhatsApp   |
+----------------+          +----+----------+----+          +------------------+
                                |          |
                        policy/approval    | canonical reads
                                |          |
                      +---------v----------v--+
                      | PostgreSQL + outbox   |
                      | audit + tenant state  |
                      +---------+-------------+
                                |
                         durable workflow
                                |
                      +---------v-------------+
                      | Workflow workers       |
                      | planning + execution   |
                      +---------+-------------+
                                |
                  scoped command|         |evidence
                                |
                      +---------v-------------+
                      | Isolated microVM       |
                      | persistent browser     |
                      | live view + takeover   |
                      +---------+-------------+
                                |
                      +---------v-------------+
                      | Airbnb host interface  |
                      +---------+-------------+
                                |
                         fresh re-read
                                |
                      +---------v-------------+
                      | Independent verifier   |
                      +-----------------------+
```

### 4.1 Control plane

Keep the current TypeScript/Express application and evolve it into a modular monolith. Do not rewrite the product into microservices before the workflows are stable.

Modules:

- identity and organizations;
- roles, property scope, and WhatsApp identity binding;
- Airbnb connection and listing mapping;
- command ingestion and conversation history;
- AI proposal service;
- policy and approvals;
- workflows, jobs, and schedules;
- canonical Airbnb observations;
- tasks and incidents;
- notification outbox;
- evidence and audit;
- admin, support, and operational health.

Run the HTTP API and background workers as separate processes built from the same domain packages.

### 4.2 Durable workflow engine

Use managed Temporal for long-running, restart-safe workflows that pause for approval, MFA takeover, reconciliation, or scheduled follow-up. Use PostgreSQL as the authoritative business store and a transactional outbox to start workflows and send messages without losing work.

Temporal owns orchestration timing and retries; PostgreSQL owns business truth. A workflow ID is derived from the organization, connection, and command idempotency key. Workflow activities must be idempotent because Temporal may replay or retry them.

Redis is optional and limited to short-lived presence, rate limiting, and live-view coordination. It is never the authoritative store for approvals, commands, or audit.

### 4.3 Computer execution plane

Create a `ComputerRuntime` abstraction so the provider can change without rewriting Airbnb skills. The initial runtime should supply:

- a microVM or equivalently isolated machine per active Airbnb session;
- headed Chromium with a fixed supported resolution and locale;
- encrypted persistent profile per Airbnb member account;
- live video or screenshot stream;
- secure human takeover;
- allowlisted network egress;
- session pause, revoke, and destruction;
- step, time, navigation, and upload limits;
- structured action and screenshot recording.

Use a managed isolated desktop service under an approved DPA for early controlled accounts. Move the runtime into VirtuHost-controlled cloud infrastructure/BYOC before broad customer availability if the managed provider cannot meet region, key-management, retention, support-access, or subprocessor requirements.

Never reuse a browser profile, filesystem, clipboard, or VM across organizations. Only one write lease may exist per Airbnb account.

### 4.4 Model architecture

Use three bounded model roles behind replaceable interfaces:

1. **Planner:** converts natural language into a strict proposal using authenticated VirtuHost context.
2. **Computer-use executor:** receives one approved workflow command and bounded browser tools.
3. **Verifier:** receives the expected postconditions plus fresh observations and determines whether the exact change persisted.

Use deterministic code for listing identity, dates, totals, hashes, permissions, conflict checks, message limits, approval expiry, and state comparisons. The verifier must run with a clean task context and cannot rely on the executor's assertion of success.

### 4.5 Data platform

- Managed PostgreSQL with point-in-time recovery, encryption, migrations, tenant-scoped repositories, and automated cross-tenant tests.
- Private object storage for redacted screenshots, video segments, uploaded listing photos, and exported evidence.
- KMS-backed envelope encryption for browser profiles, session material, and sensitive connection metadata.
- Secrets manager for Meta, model, workflow, storage, and infrastructure credentials.
- Central logs, traces, metrics, error monitoring, security alerts, and append-only audit export.
- Separate development, test, staging, Airbnb-review, pilot, and production environments.

## 5. Core records and state machines

### 5.1 Core records

- `Organization`
- `User`
- `RoleAssignment`
- `WhatsAppIdentity`
- `AirbnbConnection`
- `AuthorizationGrant`
- `BrowserProfile`
- `BrowserSession`
- `Property`
- `ListingMapping`
- `AirbnbObservation`
- `ReservationSnapshot`
- `ConversationSnapshot`
- `Command`
- `ActionProposal`
- `Approval`
- `ExecutionRun`
- `ExecutionStep`
- `VerificationResult`
- `EvidenceArtifact`
- `AutomationPolicy`
- `WorkflowSchedule`
- `Task`
- `Incident`
- `InboundEvent`
- `OutboundNotification`
- `AuditEvent`
- `RetentionJob`

Every record containing customer state carries `organizationId`. Airbnb-facing records also carry `connectionId`, `externalListingId` where applicable, a correlation ID, and the observation time.

### 5.2 Command lifecycle

```text
received
  -> resolving
  -> needs_clarification | proposed
  -> awaiting_approval
  -> approved | rejected | expired
  -> queued
  -> preflight
  -> executing
  -> verifying
  -> verified
```

Exceptional states:

```text
needs_takeover
paused
cancelled
failed
uncertain
verification_mismatch
reconciling
rolled_back
rollback_blocked
```

An `uncertain` run cannot be retried until reconciliation proves whether the original side effect occurred.

### 5.3 Approval contract

An approval binds:

- organization and authorized actor;
- role and property scope;
- exact canonical proposal hash;
- Airbnb connection and listing identity;
- baseline observation version;
- before and after values;
- dates, currency, and timezone where relevant;
- risk classification;
- expiry;
- rollback plan;
- automation policy version;
- authorization-grant version.

A plain “yes” cannot approve an ambiguous, changed, expired, or previously consumed proposal.

## 6. Roles and permissions

Roles:

- **Owner:** account connection, policies, team, billing, all property actions.
- **Manager:** assigned-property operations and bounded policy management.
- **Operations:** messages, tasks, incidents, and approved calendar actions.
- **Viewer/owner representative:** reports and read-only evidence.
- **Cleaner/contractor:** assigned tasks only; no Airbnb or guest financial data.
- **VirtuHost support:** no default customer access; time-bound audited elevation only.

Enforce permissions in service methods and database queries, not only in the UI. Require MFA or passkeys for owners, managers, support, account connection, policy changes, session revocation, and critical approvals.

## 7. Action and autonomy policy

| Capability | Initial policy | Mature bounded policy | Verification |
| --- | --- | --- | --- |
| Read listing, calendar, reservation, inbox | Allowed for scoped roles | Scheduled/on-demand | Fresh screen observation with timestamp |
| Draft message or listing text | Automatic | Automatic | Schema and policy checks |
| Send routine guest message | Per-message approval | Opt-in template and trigger policy | Correct conversation, body, timestamp |
| Sensitive guest message | Human approval | Human approval | Correct conversation and exact text |
| Block/open dates | Exact-date approval | Bounded maintenance policy | Every selected and adjacent date re-read |
| Change nightly rates/minimum stay | Exact amount/date approval | Floor, ceiling, percentage, horizon limits | Sample and aggregate calendar re-read |
| Edit listing title/description/amenities | Before/after approval | Approval required | Host editor and public view when applicable |
| Upload/reorder/delete photos | Contact-sheet approval | Approval required; delete uses strong confirmation | Ordered gallery and asset comparison |
| Submit guest review | Ratings and text approval | Approval required | Submission state and timestamp |
| Accept/decline booking request | Human takeover | Policy decision after Airbnb agreement | Reservation state |
| Trip change or cancellation | Strong confirmation and takeover | Human-controlled | Reservation and financial summary |
| Refunds, payouts, tax, identity, security, permissions, claims | Denied | Human-only | Not applicable |

Sensitive categories include compensation, disputes, safety, discrimination, legal threats, personal documents, access-code exposure, cancellation, and financial commitments.

## 8. Full product workflows

### 8.1 Secure onboarding and Airbnb connection

1. Owner creates a VirtuHost organization and completes MFA/passkey setup.
2. Owner binds a WhatsApp number through a one-time challenge shown in the app.
3. Owner creates a browser connection and receives a private live-view session.
4. Owner takes control and authenticates directly with Airbnb, including MFA or passkey.
5. VirtuHost stores only the encrypted browser profile/session material.
6. Agent reads the account's accessible listings and presents them for selection.
7. Owner grants listing-level scope and initial action policies.
8. VirtuHost verifies the mapping and records the authorization basis.
9. The owner can revoke the session or connection immediately.

### 8.2 Daily briefing

1. A scheduled workflow leases the Airbnb account.
2. Browser skills read relevant calendar, reservation, and inbox screens.
3. Observations are timestamped and normalized.
4. Deterministic services compute arrivals, departures, unread items, at-risk tasks, and stale state.
5. VirtuHost sends one concise WhatsApp briefing and updates the app.
6. If part of the read is unavailable, the briefing labels that section stale rather than fabricating a complete view.

### 8.3 Guest-message workflow

1. Agent reads an authorized message thread or receives a host request referencing it.
2. Guest content is screened and treated as untrusted.
3. Property knowledge and reservation facts are retrieved from approved sources.
4. Planner drafts a response and classifies sensitivity.
5. Policy auto-sends only if a matching host policy exists; otherwise it requests approval.
6. Executor rechecks conversation and reservation identity immediately before sending.
7. Verifier reopens the thread and confirms recipient, exact body, and timestamp.
8. Delivery is reported to both surfaces and added to the audit ledger.

### 8.4 Calendar and pricing workflow

1. Resolve the property, local dates, and requested change.
2. Read the current Airbnb calendar and relevant rules.
3. Check reservations, owner blocks, linked calendars, lead time, minimum stay, and host guardrails.
4. Show exact dates and financial or availability effect.
5. Bind approval to the baseline and proposed values.
6. Re-read before execution; abort on drift.
7. Execute with one account-level write lease.
8. Reload the calendar and verify all target and adjacent dates.
9. Schedule a follow-up reconciliation for high-impact batches.

### 8.5 Listing-content and photo workflow

1. Read and retain the current field or ordered gallery.
2. Scan and validate uploaded files; preserve originals.
3. Create exact copy or contact-sheet preview.
4. Obtain approval.
5. Recheck listing ID, current value, and authorization.
6. Apply one field or one gallery operation at a time.
7. Reopen the listing editor and, where appropriate, the public listing.
8. Report host-editor verification separately from public propagation.
9. Offer rollback only when no intervening edit would be overwritten.

### 8.6 Task and incident workflow

VirtuHost owns cleaning, inspection, and maintenance tasks without relying on Airbnb. Reservation observations create or reschedule idempotent tasks. Cleaners and contractors interact through limited WhatsApp flows, submit evidence, and never receive unnecessary guest or financial information. Safety and emergency incidents escalate immediately to a human.

## 9. Browser skill design

Build separate, versioned skills rather than one unrestricted “use Airbnb” prompt:

- session health and account identity;
- portfolio/listing discovery;
- calendar read;
- calendar availability update;
- rate and restriction update;
- inbox and conversation read;
- guest message send;
- listing title/description/amenities;
- photo tour upload/reorder/delete;
- reservation read;
- request acceptance/decline with takeover;
- trip change/cancellation with takeover;
- review drafting/submission;
- post-action verification;
- rollback/reconciliation.

Each skill defines:

- permitted entry points and domains;
- listing/account identity assertions;
- expected screen fingerprints;
- required preconditions;
- allowed controls and maximum steps;
- final-action confirmation boundary;
- explicit postconditions;
- retry classification;
- takeover and stop conditions;
- evidence and redaction requirements;
- compatible UI versions and test fixtures.

Use a hybrid interaction strategy:

- accessibility and DOM labels for stable identification and exact values;
- screenshots and visual reasoning for layout, state, and controlled adaptation;
- deterministic helpers for dates, currency, hashes, image ordering, text comparison, and screenshots;
- no direct use of undocumented network calls.

## 10. Bidirectional app and WhatsApp experience

Both surfaces operate the same command, proposal, approval, and run records.

### App-originated action

```text
App command
-> Airbnb baseline read
-> WhatsApp approval with exact change
-> approval reply
-> app execution timeline
-> verified Airbnb result
-> confirmation in app and WhatsApp
```

### WhatsApp-originated action

```text
WhatsApp instruction
-> Airbnb baseline read
-> detailed app approval
-> app approval
-> WhatsApp progress notice
-> verified Airbnb result
-> evidence in app and concise WhatsApp confirmation
```

The app must display:

- live/stale/unavailable data state;
- current Airbnb connection and session health;
- proposal before/after values;
- policy reason and risk level;
- approval actor and expiry;
- queued, executing, takeover, verifying, and final states;
- live computer view and takeover controls;
- redacted evidence and exact verification result;
- rollback availability and conflict warnings;
- immutable activity history.

WhatsApp must support:

- signed inbound webhooks and durable deduplication;
- verified host identity and organization routing;
- interactive approval buttons where available, plus secure textual fallback codes;
- approved templates outside the customer-service window;
- message IDs, delivery/read/failed status, and ambiguous-timeout handling;
- concise progress notices without notification spam;
- media download, validation, storage, and expiry;
- pause, status, and emergency handoff commands.

## 11. Security architecture

### 11.1 Threats to design for

- stolen browser profile or session cookie;
- credential/MFA capture;
- cross-tenant data access;
- wrong-account, wrong-listing, wrong-date, or wrong-conversation action;
- replayed or altered approval;
- duplicate write after timeout or worker restart;
- prompt injection in guest messages, listings, reviews, web pages, or attachments;
- malicious link navigation or file download;
- insider/support misuse;
- unredacted screenshots or logs;
- UI drift causing silent misclicks;
- model hallucination or false success;
- concurrent human and agent edits;
- supply-chain compromise;
- unavailable browser provider or model provider.

### 11.2 Required controls

- OIDC authentication, MFA/passkeys, short sessions, device/session management.
- Organization- and property-scoped RBAC enforced server-side.
- Tenant context required in every repository method and background job.
- KMS envelope encryption and automatic key rotation.
- Secrets never available to the planner or executor model.
- Private browser network, strict egress allowlist, blocked downloads by default.
- No shell, email, cloud drive, password manager, or arbitrary browsing tool in an Airbnb run.
- Source-to-sink prompt-injection monitor before sensitive tool use.
- Immutable payload hashes, expiring approvals, single consumption, baseline version checks.
- Account-level write leases and idempotency keys.
- Independent verification and delayed reconciliation.
- Redacted structured logs; encrypted, short-lived evidence access.
- Just-in-time, approved, recorded support access.
- Per-listing, per-connection, and global kill switches.
- Signed builds, dependency scanning, secret scanning, SBOM, and protected deployments.
- Annual penetration test before general availability and targeted retest after material browser-control changes.

### 11.3 Privacy and POPIA

- Complete a data inventory, records-of-processing register, and personal-information impact assessment.
- Define host, VirtuHost, model provider, browser provider, storage provider, and support responsibilities in written agreements.
- Minimize guest data sent to models and redact identifiers not needed for the task.
- Establish lawful purpose, retention, export, correction, deletion, and data-subject request workflows.
- Restrict cross-border transfers to approved regions and contractual safeguards.
- Maintain breach detection, assessment, operator notification, regulator/data-subject procedures, and evidence.
- Separate door/access codes and safety-sensitive property knowledge from general model context.

“Fully secure” must be demonstrated through controls and evidence; it must not be presented as an absolute guarantee.

## 12. Reliability, efficiency, and operating targets

### Reliability design

- Webhooks are acknowledged after durable inbox storage, not after completing work.
- Database changes and workflow/message starts use a transactional outbox.
- All external side effects have stable idempotency keys.
- A timeout after a potential write produces `uncertain`, followed by reconciliation—not blind retry.
- One browser writes to an Airbnb account at a time.
- Preflight detects concurrent human changes and invalidates stale approvals.
- Browser sessions heartbeat and workers lose their lease before another worker may resume.
- UI drift stops the affected skill at the first failed assertion.
- Notifications retry independently of already completed Airbnb actions.
- Failed components degrade visibly; cached data is labelled with its observation time.

### Efficiency design

- Reuse a warm browser only within the same Airbnb account and security boundary.
- Batch compatible reads in one session, but keep writes as separately approved atomic commands.
- Prioritize inbox and near-term stays; avoid indiscriminate full-account polling.
- Store normalized observations with TTL and provenance so multiple user questions can reuse fresh state.
- Use deterministic navigation when the screen fingerprint matches; invoke expensive visual reasoning only for uncertainty or drift.
- Compress and deduplicate screenshots while retaining evidence-quality originals only where required.
- Route simple classification/drafting to a lower-cost model and reserve computer-use/verifier models for browser steps.
- Apply organization budgets, action quotas, concurrency limits, and runaway-workflow caps.

### Initial SLOs

| Measure | Target |
| --- | ---: |
| Control-plane availability | 99.9% monthly |
| WhatsApp webhook durable acceptance | 99.95% |
| App/WhatsApp command acknowledgement | p95 under 5 seconds |
| Routine proposal creation | p95 under 30 seconds |
| Approved browser action start | p95 under 60 seconds when session is healthy |
| Routine verified action completion | p95 under 3 minutes |
| False success | 0 tolerated |
| Duplicate consequential writes | 0 tolerated |
| Cross-tenant access | 0 tolerated |
| Approval bypass | 0 tolerated |
| Recovery point objective | 15 minutes or better |
| Recovery time objective | 4 hours or better |

## 13. Repository implementation map

### Preserve and extend

- `apps/api/src/app.ts`
- `apps/api/src/config.ts`
- `apps/api/src/server.ts`
- `apps/api/src/domain/types.ts`
- `apps/api/src/ai/llm-client.ts`
- `apps/api/src/ai/proposal-schema.ts`
- `apps/api/src/policy/action-policy.ts`
- `apps/api/src/integrations/contracts.ts`
- `apps/api/src/integrations/capabilities.ts`
- `apps/api/src/integrations/registry.ts`
- `apps/api/src/integrations/errors.ts`
- `apps/api/src/whatsapp/signature.ts`
- `apps/api/src/whatsapp/types.ts`
- `apps/api/src/whatsapp/transport.ts`
- `Frontend/src/App2.tsx`
- `Frontend/src/lib/api.ts`
- `Frontend/src/lib/store.ts`

Keep `FakeProviderAdapter`, SQLite, and seeded frontend data for automated development tests only. They must be impossible to enable in staging, Airbnb-review, pilot, or production environments.

### Add backend modules

```text
apps/api/src/auth/
apps/api/src/organizations/
apps/api/src/connections/
apps/api/src/commands/
apps/api/src/approvals/
apps/api/src/executions/
apps/api/src/verification/
apps/api/src/audit/
apps/api/src/evidence/
apps/api/src/notifications/
apps/api/src/automation/
apps/api/src/tasks/
apps/api/src/incidents/
apps/api/src/repositories/
apps/api/src/db/
apps/api/src/temporal/
apps/api/src/ai/orchestrator.ts
apps/api/src/ai/proposal-service.ts
apps/api/src/integrations/airbnb-browser/
apps/api/migrations/
```

### Add browser-worker application

```text
apps/browser-worker/package.json
apps/browser-worker/src/worker.ts
apps/browser-worker/src/runtime/
apps/browser-worker/src/session/
apps/browser-worker/src/security/
apps/browser-worker/src/evidence/
apps/browser-worker/src/verification/
apps/browser-worker/src/airbnb/account/
apps/browser-worker/src/airbnb/calendar/
apps/browser-worker/src/airbnb/pricing/
apps/browser-worker/src/airbnb/messages/
apps/browser-worker/src/airbnb/listing/
apps/browser-worker/src/airbnb/photos/
apps/browser-worker/src/airbnb/reservations/
apps/browser-worker/src/airbnb/reviews/
apps/browser-worker/test-fixtures/
```

### Add frontend surfaces

```text
Frontend/src/features/auth/
Frontend/src/features/onboarding/
Frontend/src/features/connections/
Frontend/src/features/commands/
Frontend/src/features/approvals/
Frontend/src/features/executions/
Frontend/src/features/evidence/
Frontend/src/features/policies/
Frontend/src/features/team/
Frontend/src/features/audit/
Frontend/src/features/incidents/
```

Break `App2.tsx` into routed feature components during integration; preserve the established visual identity and mobile-first composer.

### Add infrastructure and governance

```text
deploy/
infra/
.github/workflows/
docs/architecture/
docs/security/
docs/runbooks/
docs/airbnb-review/
```

## 14. Delivery programme

Estimated duration: **22–26 weeks** with the core team available throughout. A real, secure vertical slice should be operational by weeks 10–12; the remaining work turns it into the complete production system.

### Phase 0 — Authorization, architecture, and threat model (weeks 1–2)

- Confirm the Airbnb evaluation scope and controlled accounts.
- Finalize product capability and risk matrices.
- Complete architecture decision records for workflow engine, browser runtime, Postgres, storage, model providers, regions, and key management.
- Create data-flow and threat models.
- Define SLOs, incident severity, evidence retention, and environment boundaries.
- Establish CI, dependency policy, secrets handling, and branch protections.

**Gate:** signed scope, approved architecture, no unresolved critical threat without an owner and mitigation.

### Phase 1 — Production identity and data foundation (weeks 3–6)

- Add organizations, users, RBAC, MFA/passkeys, sessions, and support-access controls.
- Replace production SQLite with PostgreSQL migrations and tenant-scoped repositories.
- Add authorization grants, Airbnb connections, listing mappings, commands, proposals, approvals, audit, and evidence records.
- Add transactional inbox/outbox, idempotency, retention jobs, and encrypted object storage.
- Add readiness, metrics, tracing, backup, and restore procedures.
- Keep local fake mode isolated behind explicit development configuration.

**Gate:** empty migration, rollback-safe forward migration, cross-tenant suite, restart persistence, backup restoration, and production configuration validation pass.

### Phase 2 — Real WhatsApp and app control plane (weeks 5–8)

- Complete official WhatsApp Cloud transport, message IDs/statuses, interactive approvals, templates, media, deduplication, and retries.
- Bind WhatsApp identities to organizations through the app.
- Replace `/api/demo/command` with a channel-neutral command service.
- Implement a real planner behind `LlmClient` and retain strict proposal validation.
- Implement shared app/WhatsApp proposals, approvals, command timelines, and SSE event streaming.
- Replace seeded live UI states with loading, live, stale, unavailable, and error states.
- Add account pause, policy, approval, activity, and connection-health surfaces.

**Gate:** a command from either surface produces one durable proposal; an approval from the other surface creates one workflow; restart, replay, or duplicate delivery cannot duplicate it.

### Phase 3 — Secure computer runtime and connection onboarding (weeks 7–11)

- Implement `ComputerRuntime`, isolated session provisioning, encrypted profiles, live view, takeover, revocation, and kill switches.
- Implement owner-controlled Airbnb login without credential capture.
- Add account/listing identity skills and capability discovery.
- Add network allowlisting, download restrictions, prompt-injection monitor, step/time budgets, and evidence redaction.
- Add execution leases, heartbeats, pause/resume, uncertain state, and independent verification.
- Build the high-fidelity Airbnb-like test fixture solely for automated failure and UI-drift testing.

**Gate:** secure connection/revocation works; wrong-account and cross-tenant tests fail closed; executor cannot access credentials or unapproved domains; takeover reliably stops the agent.

### Phase 4 — First real vertical slice (weeks 10–12)

Deliver actual functionality on an authorized Airbnb listing:

1. App request -> WhatsApp approval -> maintenance date block -> independent verification -> confirmation on both surfaces.
2. WhatsApp instruction -> app approval -> listing-description update -> independent verification -> confirmation on both surfaces.
3. Conflict-aware rollback for both changes.

**Gate:** at least 20 controlled live runs with zero wrong-target writes, approval bypass, duplicates, adjacent-date changes, blind retries, false success, or rollback overwrite.

### Phase 5 — Core Airbnb operations (weeks 12–18)

- Live portfolio/listing discovery and scoped observations.
- Calendar reads, block/open, prices, minimum stay, and restrictions.
- Inbox reads, reply drafts, approved sends, scheduled routine messages, and handoff.
- Listing title, description, amenities, instructions, and house rules.
- Photo upload, validation, room assignment, captions, reorder, cover, and delete.
- Reservation reads and change-request support.
- Reviews and review responses.
- Daily briefings, tasks, turnovers, incidents, contractor evidence, and owner reports.
- Per-property automation policies and budgets.

**Gate:** each workflow independently meets its safety, verification, idempotency, takeover, UI-drift, and rollback tests before it is enabled for a customer.

### Phase 6 — Hardening, efficiency, and operational readiness (weeks 17–22)

- Load and concurrency tests for API, webhooks, workflows, and browser fleet.
- Warm-session, read-batching, cache, screenshot, and model-routing optimization.
- Chaos testing for worker death, browser loss, model timeout, Meta outage, storage outage, and database failover.
- Prompt-injection and adversarial-page evaluations.
- External penetration test and remediation.
- POPIA documentation, subprocessor review, retention jobs, data export/deletion, and breach procedure.
- On-call rotation, dashboards, alerts, incident playbooks, customer support, and status communication.
- Disaster recovery exercise and restoration evidence.

**Gate:** security findings closed or risk-accepted, SLOs met in staging, restore exercise passed, no critical operational runbook gap.

### Phase 7 — Airbnb review and controlled production pilot (weeks 22–26)

- Freeze a review candidate after clean end-to-end rehearsals.
- Run Airbnb-approved workflows on designated accounts.
- Present architecture, threat model, authorization enforcement, live takeover, audit, verification, and kill switches.
- Provide an uninterrupted app -> WhatsApp -> computer -> Airbnb -> verification -> both-channel result journey.
- Pilot with three to five authorized hosts after Airbnb review.
- Expand listings and autonomy only after workflow-specific evidence gates.

**Gate:** written approval for the next operating scope, stable pilot metrics, and no unresolved critical security or platform-policy issue.

## 15. Team and ownership

Recommended core team:

- 1 technical lead/architect;
- 2 backend and workflow engineers;
- 1 browser/computer-use engineer;
- 1 frontend/mobile engineer;
- 1 platform/SRE engineer;
- 1 QA/automation and agent-evaluation engineer;
- 1 product designer/operations lead;
- fractional security engineer, privacy counsel, and penetration-test partner.

Do not assign browser security, model behaviour, and workflow reliability to a single engineer without independent review. Every production workflow needs an engineering owner, product/risk owner, test owner, and operational runbook owner.

## 16. Verification programme

### Automated layers

- unit tests for schemas, permissions, policy, hashes, dates, money, and redaction;
- repository and cross-tenant isolation tests;
- provider-contract tests for fake and browser adapters;
- workflow replay, retry, signal, timeout, and cancellation tests;
- WhatsApp webhook, delivery, template, media, and replay tests;
- browser fixture tests for normal screens, UI variants, popovers, stale state, challenges, timeouts, and misleading success toasts;
- prompt-injection and malicious-link evaluations;
- frontend mobile, tablet, desktop, accessibility, offline, stale-state, and takeover tests;
- infrastructure policy, secret, dependency, container, and image scans;
- load, soak, chaos, backup, and restore tests.

### Workflow certification

Before enabling a browser skill:

1. 1,000 randomized fixture runs without wrong-target or false-success behaviour.
2. Security review of inputs, tools, navigation, evidence, and stop conditions.
3. Human-observed authorized shadow reads.
4. Controlled live writes with exact rollback.
5. Deliberate failure before save, after save, and during verification.
6. Concurrent human-edit test.
7. UI-drift and unexpected-dialog test.
8. Kill-switch and session-revocation test.
9. Runbook rehearsal by someone other than the feature author.

### Release blockers

Any of the following blocks release:

- cross-tenant data exposure;
- credential, cookie, MFA, or sensitive screenshot leakage;
- wrong listing, guest, dates, amount, or action;
- approval bypass or replay;
- duplicate consequential write;
- false success;
- blind retry after an uncertain write;
- inability to pause or revoke a browser session;
- missing or failed restoration for an Airbnb review change;
- unbounded navigation or model tool access;
- fake data presented as live;
- absent authorization grant.

## 17. Airbnb technical-review package

Prepare these from the real system:

- one-page product and operating-boundary summary;
- system architecture and data-flow diagrams;
- browser isolation and credential-handling design;
- threat model and mitigations;
- action risk and approval matrix;
- authorization-grant enforcement example;
- model/tool boundaries and prompt-injection controls;
- sample audit chain linking WhatsApp, app, workflow, browser steps, evidence, verification, and rollback;
- live-view, takeover, account pause, and global kill-switch demonstration;
- penetration-test and dependency/security scan summary;
- POPIA/privacy and subprocessor summary;
- SLOs, monitoring, incident response, backup, and restore evidence;
- workflow certification results;
- known limitations and prohibited actions;
- uninterrupted recording of a previously completed real run, clearly labelled as supporting evidence;
- live real workflow with a designated Airbnb listing;
- verified rollback before the session ends.

### Recommended live review journey

1. Reviewer sees the controlled Airbnb listing baseline.
2. Host requests a maintenance block in the VirtuHost app.
3. Exact approval arrives on the real host WhatsApp number.
4. Host approves; reviewer watches the isolated computer operate Airbnb.
5. Independent verifier reloads and confirms the calendar state.
6. Both app and WhatsApp show the same verified command ID and result.
7. Host sends a truthful description update through WhatsApp.
8. App shows the live baseline and exact proposal; host approves.
9. Computer applies and verifies the listing edit.
10. Reviewer inspects the audit/evidence chain and then observes conflict-aware rollback.
11. Reviewer sees how pause, takeover, permission denial, and UI-drift failure behave safely.

## 18. Definition of complete

The system is complete for controlled production only when:

- real app and WhatsApp identities operate one shared command history;
- real Airbnb accounts connect without VirtuHost handling login secrets;
- every supported action has a versioned browser skill, policy, verifier, tests, and runbook;
- every consequential action is authorized, idempotent, auditable, and independently verified;
- ambiguous outcomes remain uncertain until reconciled;
- tenant isolation, encryption, retention, access control, and privacy workflows are verified;
- monitoring, on-call, incident response, backup, and restore operate in production;
- the browser fleet meets security and reliability gates;
- fake data and fake providers cannot run in live environments;
- Airbnb has reviewed or authorized the applicable operating scope;
- the real Airbnb review journey and rollback pass without manual repair.

## 19. Immediate first sprint

The first two-week sprint should produce decisions and foundations, not visible browser clicking:

1. Capture Airbnb's written evaluation scope and designated accounts.
2. Approve the architecture and browser-runtime decision records.
3. Complete the threat model and data-flow diagram.
4. Define production tables, tenant-scoped repository contracts, command lifecycle, approval hash, and authorization-grant schema.
5. Establish managed PostgreSQL, Temporal, object storage, KMS/secrets, and environment separation.
6. Create CI security gates and production configuration validation.
7. Convert the app and WhatsApp handlers to one channel-neutral command contract.
8. Define the two first browser skills and their explicit preconditions/postconditions.
9. Create the Airbnb review evidence checklist and named owners.

No broad UI redesign, PMS integration, pricing engine, photo workflow, or reservation mutation should enter this sprint.
