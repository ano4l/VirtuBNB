# VirtuHost Frontend actual-app plan

## Outcome

Make `Frontend` the sole, first-class VirtuHost application UI. Preserve its current clean hospitality/Apple-like design and exact `thinking-orbs` AI identity, complete the unfinished product flows, and connect its truthful operational surfaces to the existing Express/SQLite API.

## Architecture

1. Add `Frontend` to the pnpm workspace and expose root `dev:web`, `dev`, `build`, and `typecheck` scripts so the UI is built and run as part of VirtuHost rather than as a detached Figma prototype.
2. Keep `apps/api` as the backend and pair the browser through the existing short-lived session flow. Never place `HOST_API_TOKEN` in browser code.
3. Add a typed frontend API/state layer for pairing, snapshot hydration, approval decisions, task completion, activity retry, and safe demo AI commands.
4. Extend the backend demo domain for bookings, guest conversations, calendar availability, listing details, and insights so those screens no longer depend on disconnected hardcoded UI state. Mutations remain preview/demo actions unless a real provider confirms them.

## UI completion

1. Preserve the existing onboarding, Home, Bookings, AI, Messages, Listings, details, typography, palette, photography, glass dock, and exact `ThinkingOrb` wrapper.
2. Add working screens for guest conversation, listing editor, calendar, insights reachability, activity/history, task/approval operations, and connection/settings.
3. Make booking filters, message rows, listing tabs, booking actions, AI suggestions, approval/edit/decline, Generate Reply, date selection, and optimisation actions functional.
4. Add designed loading, empty, offline, error, listening, uploading, thinking, confirmation, and expired-session states.
5. Replace the fixed desktop phone letterbox with a responsive product shell while keeping the focused one-handed mobile composition.

## `coolshii.md` integration

1. Install and use `border-beam` with `colorVariant="sunset"` only on the active AI input/composer, at restrained strength.
2. Install and use `metal-fx` on one circular AI send/voice control with low-strength silver/chromatic material, preserving the accessible button and library fallback.
3. Keep shader animation subtle and respect reduced motion. Do not turn normal cards or navigation into effect-heavy surfaces.

## Safety and truth

- Label seeded/providerless operational data as demo or preview where necessary.
- Sensitive pricing, availability, listing, and guest-message changes require review/confirmation.
- Show completion only after local/API state confirms it; never claim that Airbnb, Meta, or a PMS was updated.
- Preserve signed WhatsApp webhooks, allowlisting, pairing, audit activity, and session boundaries.

## Verification

- Run frontend TypeScript and production build, backend build/typecheck, and all API tests.
- Exercise pairing, snapshot hydration, all five primary navigation destinations, booking filters/detail, guest reply draft/send preview, listing editor, calendar selection, insights, task completion, approval decision, activity retry, session expiry/error, and AI action states.
- Browser-check 375x812, 430x932, tablet, and 1440x900 layouts; capture before/after evidence, inspect console/network failures, reduced motion, WebGL fallback, and bottom-nav/composer overlap.
- Update README and build status with only verified claims.
