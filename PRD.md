# VirtuHost Product Requirements Document

**Version:** 0.1
**Status:** Initial product definition
**Date:** 7 September 2026
**Product:** VirtuHost
**Working tagline:** Run every stay from WhatsApp.

---

## 1. Executive summary

VirtuHost is an affordable, WhatsApp-first operations platform for short-term-rental hosts and small property managers. It allows an operator to monitor bookings, manage listing content, coordinate guest communication, handle property issues, and assign operational work by sending natural-language messages to a trusted virtual property manager.

The product is designed for hosts who find traditional property-management systems expensive, complicated, or inconvenient. WhatsApp is the primary day-to-day interface; a lightweight web application is used for onboarding, integrations, billing, permissions, audit history, and complex configuration.

VirtuHost will initially connect to Airbnb through an approved property-management system or channel-manager integration that exposes the required capabilities. Direct Airbnb connectivity is a later-stage objective subject to Airbnb partnership and API approval. VirtuHost will never require a host to share their Airbnb password or depend on unauthorized scraping or browser automation.

## 2. Product vision

Enable a host to operate their short-term-rental business from the messaging application they already use every day.

An operator should be able to ask:

- “What is happening at my properties today?”
- “Did we receive any new bookings?”
- “Move the balcony photo to the first position.”
- “Improve the description, but let me approve it first.”
- “Ask tomorrow's guest whether they need parking.”
- “The geyser is leaking. Notify the guest and assign the plumber.”
- “Which properties have not been cleaned for tomorrow's check-ins?”

VirtuHost should understand the request, retrieve the relevant property context, show the proposed action, obtain approval when required, execute the action through an authorized integration, and return a clear result.

## 3. Problem statement

Independent hosts and small property managers operate across disconnected tools:

- Airbnb or another booking platform for listings and reservations;
- WhatsApp for cleaners, contractors, co-hosts, and sometimes guests;
- calendars or spreadsheets for operational planning;
- email for notifications;
- separate tools for pricing, maintenance, and reporting.

This creates missed messages, repetitive work, delayed responses, inconsistent listing information, and poor visibility. Existing property-management products often prioritize large portfolios and desktop dashboards. Small operators need a simpler and more affordable control layer.

## 4. Product positioning

### Core promise

**VirtuHost is the virtual property manager that runs bookings, guests, listings, and daily operations through WhatsApp.**

### Product principles

1. **Conversation first:** Routine work should be possible without opening a dashboard.
2. **Safe execution:** Material changes require a preview and explicit approval.
3. **Simple by default:** Use plain language and guided choices instead of property-management jargon.
4. **Trust through evidence:** Confirm what changed, where it changed, and when it changed.
5. **Human control:** Operators can pause automation, take over a conversation, or reverse supported changes.
6. **Affordable operations:** Control messaging and AI costs so entry pricing remains accessible.
7. **Platform compliant:** Use authorized APIs and respect booking-platform communication rules.

## 5. Target customers

### Primary persona: Independent host

- Manages 1–5 short-term-rental properties.
- Uses WhatsApp daily.
- Manually checks bookings and coordinates cleaners.
- Does not want to learn a complex property-management system.
- Values fast alerts, reduced admin, and peace of mind.

### Secondary persona: Small property manager or co-host

- Manages 5–25 properties for multiple owners.
- Coordinates staff, cleaners, and contractors.
- Needs permissions, property grouping, assignment, and an audit trail.
- Wants automation without losing control of owner and guest relationships.

### Supporting users

- Cleaners
- Maintenance contractors
- Co-hosts
- Property owners receiving summaries

Supporting users receive only the information and actions necessary for their assigned work. They do not automatically receive access to guest or financial data.

## 6. Jobs to be done

When I receive a booking, I want the important details and next actions delivered to me so that nothing is missed.

When a guest has a question or problem, I want VirtuHost to answer safely or escalate it quickly so that the guest receives timely support.

When I need to change a listing, I want to describe the change or send new photos through WhatsApp so that I do not need to navigate a complex dashboard.

When a check-in or checkout is approaching, I want the correct people reminded and the required tasks tracked so that the property is ready.

When I ask about my business, I want an immediate, accurate summary based on connected reservation data.

## 7. Goals and non-goals

### MVP goals

- Deliver a useful daily operating experience through WhatsApp.
- Connect at least one authorized reservation/listing data source.
- Notify operators of bookings, cancellations, check-ins, and checkouts.
- Support natural-language questions about properties and reservations.
- Stage listing text and photo changes and publish them when the integration supports it.
- Draft, schedule, and send guest messages when authorized by the connected platform.
- Create and track cleaning or maintenance tasks.
- Maintain a complete audit history for automated and user-approved actions.
- Validate willingness to pay among hosts managing 1–10 properties.

### MVP non-goals

- Replacing every full property-management system.
- Building a public marketplace of properties.
- Processing accommodation payments.
- Scraping Airbnb listings or using Airbnb messages for customer solicitation.
- Asking customers for Airbnb passwords.
- Fully autonomous pricing changes without configurable limits and approval.
- Supporting every booking channel at launch.
- Communicating with guests outside the booking platform in ways that violate platform policy.

## 8. Scope model

VirtuHost separates the long-term promise from the first release.

### North-star capability

The operator can safely manage the complete lifecycle of a short-term-rental property through conversation: listing setup, availability, pricing, reservations, guest communication, property tasks, incidents, and reporting.

### MVP capability

VirtuHost acts as a WhatsApp control and intelligence layer over an authorized property-management or channel-manager integration. Available actions are determined by the connected provider's capabilities.

The application must expose a capability matrix for every integration:

| Capability | Possible states |
| --- | --- |
| Read reservations | Supported / unsupported |
| Receive reservation events | Real-time / scheduled sync / unsupported |
| Read listing content | Supported / unsupported |
| Update listing text | Supported / approval required / unsupported |
| Upload and reorder photos | Supported / approval required / unsupported |
| Read and update availability | Supported / unsupported |
| Send guest messages | Supported / draft only / unsupported |
| Update pricing | Supported / approval required / unsupported |

VirtuHost must not tell an operator that an action succeeded unless the downstream provider confirms it.

## 9. MVP user experience

### 9.1 Onboarding

1. User creates an account in the web application.
2. User verifies their mobile number.
3. User connects an available PMS or channel-manager account through an authorized flow.
4. VirtuHost imports accessible properties and reservations.
5. User selects properties to activate.
6. User configures timezone, notification preferences, team members, approval rules, and emergency contacts.
7. User sends the first WhatsApp message to VirtuHost.
8. VirtuHost confirms the properties it can manage and clearly identifies unsupported capabilities.

### 9.2 Daily briefing

At a configurable time, VirtuHost sends one concise summary containing:

- arrivals and departures;
- occupancy;
- new bookings and cancellations;
- unanswered or escalated guest issues;
- incomplete cleaning and maintenance tasks;
- actions requiring approval.

The briefing should consolidate information to limit messaging costs and notification fatigue.

### 9.3 Booking event

When a connected provider reports a new booking, VirtuHost:

1. stores the reservation and event idempotently;
2. checks property-specific workflows;
3. alerts the appropriate operator;
4. creates required operational tasks;
5. schedules eligible guest messages;
6. records all resulting actions.

Example:

> New booking at Rosebank Loft
> 12–15 September · 2 guests
> Check-in: 15:00
> Cleaning task created for 12 September.
> Reply DETAILS, MESSAGE GUEST, or TASKS.

### 9.4 Listing update

For a listing change, VirtuHost must:

1. identify the intended property;
2. ask for clarification only when ambiguity affects the result;
3. retrieve the current value;
4. prepare a before-and-after preview;
5. explain whether the connected provider supports the change;
6. request explicit approval for publication;
7. submit the change through the authorized integration;
8. verify the provider response;
9. report success, partial success, or failure;
10. add the result to the audit history.

Approval messages expire after a configurable period and cannot be reused for a different action.

### 9.5 Photo management

The operator can send photos to VirtuHost through WhatsApp. The MVP should support:

- receiving and securely storing the original image;
- validating type, size, and basic quality;
- associating the image with a selected property;
- generating a suggested caption and position;
- showing a proposed gallery order;
- requesting approval;
- publishing through the connected integration when supported;
- retaining the previous gallery state for audit and possible recovery.

AI enhancement must never silently alter the original image. Enhanced variants are presented separately and require approval.

### 9.6 Guest communication

VirtuHost can draft and, where authorized, send:

- booking acknowledgements;
- pre-arrival instructions;
- check-in reminders;
- parking or access questions;
- checkout reminders;
- responses to common property-specific questions;
- incident updates.

Messages must use the booking platform's approved channel when required. VirtuHost must not ask guests to move a booking, payment, or pre-booking conversation off-platform.

High-risk or sensitive messages require operator approval, including refunds, compensation, disputes, safety incidents, discrimination-related topics, threats, legal claims, and requests involving personal documents.

### 9.7 Issue management

When a problem is reported, VirtuHost:

1. classifies urgency and category;
2. checks the property playbook;
3. asks only the minimum necessary follow-up questions;
4. alerts the correct operator;
5. creates a task and assigns an approved service provider when configured;
6. drafts or sends an acknowledgement to the guest;
7. tracks the issue until resolved;
8. records resolution time and outcome.

Emergency or safety-related messages must immediately escalate to a human and display the configured local emergency guidance. VirtuHost must not represent itself as an emergency service.

## 10. Functional requirements

### 10.1 Conversational agent

- Understand supported commands in natural language.
- Maintain context within a conversation without confusing properties or reservations.
- Confirm the target property before any ambiguous external action.
- Provide guided reply options for common actions.
- Support cancellation of staged actions.
- Explain when an action is unsupported and offer the nearest safe alternative.
- Hand off to a human without losing conversation context.

### 10.2 Property and reservation management

- Import and synchronize properties and reservations.
- Normalize provider-specific data into a common internal model.
- Deduplicate webhook and synchronization events.
- Display sync status and last successful update.
- Preserve provider identifiers without exposing them unnecessarily.
- Respect the property's local timezone for all dates and automations.

### 10.3 Workflow automation

- Trigger workflows from booking, cancellation, check-in, checkout, message, and task events.
- Support scheduled workflows relative to arrival or departure.
- Allow workflows to be enabled per property.
- Prevent duplicate messages and tasks.
- Pause all automations at account, property, or reservation level.
- Provide retry rules and dead-letter handling for failed actions.

### 10.4 Task coordination

- Create cleaning, inspection, restocking, and maintenance tasks.
- Assign approved team members or service providers.
- Send task notifications through supported channels.
- Allow assignees to accept, decline, start, and complete tasks.
- Request completion notes and optional evidence photos.
- Escalate overdue or declined tasks.

### 10.5 Web application

The web application must provide:

- account and phone-number onboarding;
- integration setup and health status;
- property selection and configuration;
- reservation and task overview;
- team roles and permissions;
- property knowledge and message templates;
- automation settings;
- approval queue;
- searchable audit history;
- subscription and usage information;
- data export and account deletion controls.

The dashboard supports the conversation; it should not become the only practical way to operate the product.

### 10.6 Notifications

- New booking
- Modified booking
- Cancellation
- Upcoming check-in or checkout
- Guest message requiring attention
- Urgent property issue
- Failed integration or synchronization
- Task overdue or declined
- Action awaiting approval
- Daily operational briefing

Users can configure urgency, quiet hours, recipients, and digest preferences.

## 11. Roles and permissions

### Account owner

- Manages subscription, integrations, properties, users, and all policies.
- Can approve every action.

### Manager

- Manages assigned properties, reservations, messages, and tasks.
- Can approve actions allowed by the owner.

### Operations staff

- Views assigned operational information and manages tasks.
- Cannot access financial reports or change listings unless explicitly permitted.

### Service provider

- Receives and updates only assigned tasks.
- Cannot browse reservations, guest history, or unrelated properties.

Every external action must be attributable to a user, automation, or system process.

## 12. Approval and automation policy

### Read-only actions

May run immediately for authorized users:

- reservation lookup;
- task status lookup;
- listing-content lookup;
- operational summaries.

### Approval-required actions

Require a before-and-after preview in the MVP:

- listing text changes;
- photo upload, removal, or reordering;
- pricing or availability changes;
- cancellation or modification of a reservation;
- refunds, discounts, or compensation;
- messages classified as sensitive or high risk.

### Configurable automation

May run automatically after the owner enables a specific workflow:

- standard booking acknowledgements;
- pre-arrival and checkout messages;
- routine task creation;
- daily summaries;
- reminders and overdue-task escalation.

The owner must be able to inspect, pause, and disable every automation.

## 13. AI requirements and guardrails

- Use retrieval from verified property data rather than model memory for property-specific answers.
- Separate proposed actions from executed actions.
- Use deterministic service logic for permissions, approvals, dates, prices, and API calls.
- Never invent booking status, guest details, availability, fees, or successful updates.
- Clearly label drafted content before publication.
- Redact sensitive information from logs and model inputs where it is not needed.
- Detect prompt-injection attempts contained in guest messages or listing content.
- Treat external text and attachments as untrusted input.
- Escalate uncertain, high-impact, safety, legal, or payment-related decisions.
- Store the reason, inputs, approver, downstream response, and outcome for material actions.

## 14. Integration strategy

### Launch integration

Select one PMS or channel manager based on:

- authorized Airbnb connectivity;
- API and webhook availability;
- ability to read reservations and listing content;
- guest-messaging support;
- listing-edit and photo-management capabilities;
- South African and international customer coverage;
- partner terms and cost;
- developer sandbox quality.

### WhatsApp

Use the official WhatsApp Business Platform. Requirements include:

- verified webhook handling;
- message-template management;
- media upload and download;
- delivery-status tracking;
- opt-in and consent records where required;
- enforcement of messaging windows and applicable template rules;
- per-account usage and cost tracking;
- an alternative notification channel for WhatsApp outages.

### Future channels

- Telegram
- Email
- SMS for critical fallback notifications
- Booking.com and other accommodation channels
- Direct Airbnb integration, subject to approval

Channel adapters must share a normalized command and notification layer so business logic is not coupled to WhatsApp.

## 15. Conceptual data model

Core entities:

- **Organization** — customer account and subscription owner.
- **User** — authenticated operator with roles and channel identities.
- **Property** — normalized property record and timezone.
- **ListingConnection** — link between a property and an external provider listing.
- **IntegrationConnection** — credentials, scopes, health, and provider metadata.
- **Reservation** — normalized stay, status, dates, and permitted guest data.
- **Conversation** — host, guest, or task-related conversation context.
- **Message** — inbound or outbound message and delivery status.
- **ActionProposal** — staged external change with preview and expiry.
- **Approval** — approver decision tied to one immutable proposal.
- **Workflow** — configured event or schedule automation.
- **Task** — cleaning, maintenance, inspection, or restocking work.
- **Issue** — reported operational problem and resolution state.
- **MediaAsset** — original and derived property or task media.
- **AuditEvent** — append-only record of material system activity.
- **UsageRecord** — AI, messaging, media, and integration consumption.

All provider webhooks and outbound commands require idempotency keys.

## 16. Security, privacy, and compliance

- Do not collect or store Airbnb passwords.
- Use OAuth or the provider's authorized connection mechanism.
- Encrypt credentials and sensitive personal data in transit and at rest.
- Apply tenant isolation at the data-access layer.
- Use least-privilege scopes and role-based permissions.
- Require strong authentication for web access and sensitive changes.
- Verify webhook signatures and prevent replay attacks.
- Scan uploaded media and validate file types.
- Keep append-only audit records for material actions.
- Define retention periods for guest data, messages, media, and logs.
- Provide account data export and deletion workflows.
- Avoid exposing guest phone numbers or access codes to unauthorized staff.
- Record user consent and messaging preferences where legally required.
- Complete a privacy and regulatory review before public launch in each target market.

## 17. Reliability and performance requirements

- Reservation webhooks should appear as operator alerts within 60 seconds under normal conditions.
- Common WhatsApp commands should receive an acknowledgement within 5 seconds.
- No duplicate outbound guest message or operational task may result from webhook retries.
- Failed external actions must be visible and retried only when safe.
- Every provider call must have timeouts, structured errors, and observable status.
- Daily briefings must use the property's local timezone.
- Core booking and issue alerts require monitoring and an incident-response process.
- Target 99.5% monthly availability during the MVP, excluding third-party outages.

## 18. Monetization hypothesis

Pricing must be validated through customer interviews and pilot usage.

### Proposed launch structure

| Plan | Indicative price | Included properties | Intended customer |
| --- | ---: | ---: | --- |
| Starter | R249/month | 1 | Individual host |
| Host | R599/month | Up to 5 | Growing host or co-host |
| Manager | From R1,299/month | Up to 15 | Small property manager |

Potential overages or add-ons:

- additional active properties;
- WhatsApp usage beyond the included allowance;
- higher AI usage;
- premium onboarding;
- extra team seats;
- service-provider coordination;
- advanced reporting.

VirtuHost must display included usage and estimated overages clearly. Unlimited messaging should not be promised unless the economics support it.

## 19. Success metrics

### Activation

- Percentage of sign-ups connecting a property.
- Percentage receiving a successful live reservation sync.
- Time from registration to first useful WhatsApp response.
- Percentage enabling at least one automation.

### Engagement

- Weekly active organizations.
- Useful commands per active property.
- Daily briefing open or response rate.
- Percentage of operational actions completed through WhatsApp.
- Guest messages and tasks completed without manual dashboard work.

### Reliability and trust

- External action success rate.
- Duplicate message or task rate.
- Incorrect property or reservation action rate.
- Human escalation rate by workflow.
- Median booking-alert delay.

### Commercial

- Pilot-to-paid conversion.
- Monthly recurring revenue.
- Customer acquisition cost.
- Gross margin after AI, messaging, media, and integration costs.
- Logo and property churn.
- Referral rate.

### Initial validation targets

- Interview at least 15 hosts or small property managers.
- Recruit 5 design partners.
- Operate at least 20 live properties during the private pilot.
- Achieve at least 70% weekly active usage among pilot organizations.
- Convert at least 3 design partners to paid plans.

These are product hypotheses and should be revised after discovery.

## 20. Go-to-market

### Initial market

Begin with independent hosts and co-hosts in one geographically concentrated market, with South Africa as the working launch market. Local concentration simplifies support, partnerships, pricing tests, and service-provider workflows.

### Acquisition channels

- short-term-rental host communities;
- co-host and property-manager partnerships;
- cleaning and maintenance companies;
- property photographers and staging professionals;
- estate agents and property-investment communities;
- educational content and live demonstrations;
- referrals from existing customers;
- direct outreach to publicly advertised accommodation businesses using legitimate business contact information.

VirtuHost must not scrape Airbnb, automate unauthorized access, or use Airbnb's messaging system to solicit hosts.

### Design-partner offer

- discounted early subscription;
- assisted setup;
- direct product-support channel;
- influence over the initial workflow library;
- clear disclosure that the product is in pilot and that capabilities depend on connected providers.

## 21. Delivery phases

### Phase 0: Discovery and feasibility

- Interview target customers.
- Map their daily operating workflows and current tools.
- Select the launch PMS/channel-manager partner.
- Confirm API scopes, commercial terms, and sandbox behavior.
- Prototype WhatsApp conversations without executing live actions.
- Validate pricing and trust expectations.

### Phase 1: Operational assistant MVP

- Account and property onboarding.
- WhatsApp host bot.
- Reservation synchronization and booking alerts.
- Daily briefing.
- Reservation questions.
- Cleaning and maintenance tasks.
- Property knowledge base.
- Audit history and integration health.

### Phase 2: Controlled execution

- Guest-message workflows.
- Listing text updates.
- Photo upload and reordering.
- Approval queue.
- Expanded team permissions.
- Usage-based billing controls.

### Phase 3: Multi-channel manager

- Additional booking channels and messaging surfaces.
- Pricing and availability workflows.
- Owner reporting.
- Service-provider network features.
- Direct Airbnb partnership work where commercially justified.

## 22. MVP acceptance criteria

The MVP is ready for a private pilot when:

1. A new customer can create an account, verify a phone number, and connect a supported provider without developer intervention.
2. At least one live property and its reservations can be imported accurately.
3. New bookings, modifications, and cancellations create exactly one corresponding event and alert.
4. The operator can ask about today's activity and receive an answer grounded in synchronized data.
5. The operator can create, assign, and complete a cleaning or maintenance task through WhatsApp.
6. A supported listing change can be previewed, approved, executed, verified, and audited.
7. An unsupported action is clearly rejected without implying success.
8. Automated guest messages cannot be sent twice because of webhook retry or worker retry.
9. Operators can pause automations at account and property level.
10. Roles prevent service providers from viewing unrelated guest, financial, or property data.
11. Integration failure is visible to the operator and product support.
12. Account deletion and data-export workflows are operational.
13. The product has been tested with at least five representative end-to-end scenarios for each high-impact action.

## 23. Key risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Direct Airbnb API access is unavailable initially | Limits native capabilities | Launch through an authorized PMS/channel manager and maintain a capability matrix |
| Integration capabilities differ by provider | Inconsistent experience | Use adapter contracts and disclose support before an action is attempted |
| AI acts on the wrong property or reservation | Severe trust and operational failure | Deterministic identifiers, context checks, previews, approvals, and audit logs |
| WhatsApp and AI usage erode margins | Unsustainable affordable pricing | Consolidated briefings, quotas, caching, model routing, and transparent overages |
| Guest data is exposed to staff or vendors | Privacy and reputational harm | Least privilege, scoped task views, redaction, retention controls, and audit logs |
| Automated communication feels impersonal or incorrect | Lower guest satisfaction | Property-specific knowledge, tested templates, confidence thresholds, and handoff |
| Platform terms or message rules change | Feature disruption | Official integrations, policy monitoring, channel abstraction, and fallback alerts |
| Hosts expect complete autonomy too early | Product disappointment | Clear onboarding capability report and staged automation levels |

## 24. Open product decisions

- Which PMS or channel manager offers the best launch API and commercial path?
- Is the first paying segment a single-property host, multi-property host, or co-host?
- Should the first release communicate directly with guests or begin as a host-only copilot?
- Which actions will design partners trust to run automatically?
- How should WhatsApp usage be bundled into each plan?
- Which South African privacy, messaging, and consumer requirements need product-specific controls?
- Should cleaners use WhatsApp only or receive a minimal task web page as a fallback?
- How much listing and photo management does the selected integration expose?
- Which languages are required for the first market?

## 25. Immediate next steps

1. Conduct 15 structured customer interviews.
2. Produce a competitor and integration-capability comparison.
3. Select one launch integration and confirm sandbox access.
4. Prototype the ten highest-value WhatsApp conversations.
5. Test the prototype with five design partners.
6. Finalize MVP scope only after integration feasibility is confirmed.
7. Create the technical architecture, delivery plan, and clickable onboarding prototype.

---

## Appendix A: Example conversation commands

### Property overview

> **Operator:** What is happening today?
> **VirtuHost:** You have two check-ins, one checkout, and one cleaning task awaiting confirmation. Rosebank Loft is fully prepared. The cleaner for Sandton Studio has not accepted the 11:00 task.

### Listing change

> **Operator:** Change Rosebank Loft's check-in time to 3 PM.
> **VirtuHost:** Current check-in: 14:00. Proposed check-in: 15:00. This will update the connected live listing. Reply APPROVE to publish or CANCEL to discard.

### Photo update

> **Operator:** Use this photo as the Sandton Studio cover.
> **VirtuHost:** I found Sandton Studio. The new photo is suitable for the cover and will replace the current bedroom image in position 1. Review the preview, then reply APPROVE or CANCEL.

### Issue escalation

> **Operator:** The guest says there is no hot water.
> **VirtuHost:** I found the active stay at Rosebank Loft. I can acknowledge the report, create an urgent maintenance task, and notify the approved plumber. No compensation will be offered automatically. Reply APPROVE or tell me what to change.

## Appendix B: External platform references

- Airbnb API Terms of Service: https://www.airbnb.com/help/article/3418
- Airbnb software-connected listing overview: https://www.airbnb.com/help/article/2346
- Airbnb software sync choices: https://www.airbnb.com/help/article/2348
- Airbnb software partners: https://www.airbnb.com/software-partners
- Airbnb Terms of Service: https://www.airbnb.com/help/article/2908
- Meta Terms for WhatsApp Business: https://www.whatsapp.com/legal/meta-terms-whatsapp-business

Platform capabilities, policies, and pricing must be revalidated before implementation and launch.
