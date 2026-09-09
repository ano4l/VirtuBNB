# VirtuHost mobile

An Expo React Native demo of VirtuHost's premium host companion. The app and WhatsApp expose the same supported host intent vocabulary, while the mobile experience adds manual listing control, reviews, tasks, approvals, connection health and audit history.

## Run locally

```bash
npm install
npm run web
```

For device development, use `npm run android` or `npm run ios` with an Expo-compatible environment.

## Checks

```bash
npm run typecheck
npx expo export --platform web --output-dir dist-premium
```

## Vercel and PWA deployment

The mobile companion is prepared for a static Vercel project rooted at `apps/mobile`.

```bash
npm run vercel-build
npx vercel --prod
```

Vercel uses `vercel.json` to run the Expo web export and serve `dist-vercel`. The SPA rewrite keeps Expo Router deep links working. The exported web app includes an installable PWA manifest, a service worker, and an offline fallback. On iOS, use Safari's Share menu and choose **Add to Home Screen**; on Android and desktop browsers, use the browser install action when offered.

No live booking channel, WhatsApp Business credential, provider token, or LLM key is needed for this deployment. The deployed app remains the local demo/preview experience until those integrations are configured through a separate backend deployment.

The web review build uses Expo's single-page output because this authenticated application does not need static server rendering. This also avoids a server/client hydration boundary; production hosting must route application paths back to `index.html`.

## WhatsApp link

Set `EXPO_PUBLIC_WHATSAPP_URL` before starting Expo to use an approved WhatsApp Business entry point. Without it, the app clearly shows demo mode and opens a recipient-free WhatsApp draft. It never targets an arbitrary number.

## Current scope

- Three-step session onboarding with a replay control under More
- Five-tab Expo Router navigation with AI as the default destination
- Deterministic in-app demo assistant with useful listing, task and review responses
- Configurable secondary WhatsApp handoff
- Two local demo listings with generated, project-local property photography
- Listing details and manual edits for name, description, check-in time, status and automation state
- Manual edits update local display state and create an approval plus audit entry; they are never described as published
- Typed sample reviews with filters and a review-to-assistant drafting flow
- Local approval workflow with pending, loading, approved and rejected states
- Cleaning and maintenance tasks with open, completed and empty states
- Auditable activity feed with a retryable failure
- Typed domain models, shared state and a demo service boundary

No booking channel, live listing provider or live LLM is connected by default. Assistant responses are deterministic and local. Approval, manual edits, completion and retry actions are demo behaviour only. Onboarding completion is kept for the current app session and can be replayed from More.

## Future API boundary

Replace `src/services/demoService.ts` with an authenticated VirtuHost API client while preserving the method contracts used by shared app state. Production responses must distinguish accepted commands from downstream provider confirmation and must never imply a live change before confirmation.
