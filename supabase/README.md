# Supabase control plane

This folder is the authoritative database and backend contract for the
Supabase/Vercel deployment path.

## Apply safely

1. Create separate Supabase projects for development, preview/staging, and
   production. Do not point Vercel Preview at production data.
2. Link the correct project with the Supabase CLI and run the migration under
   `migrations/` against a disposable development database first.
3. Enable email/password authentication and configure MFA before inviting a
   real host. Add the Vercel production URL and preview wildcard to Supabase
   Auth redirect URLs.
4. Store `SUPABASE_URL` and `SUPABASE_SECRET_KEY` only in server/worker
   environments. `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are
   browser values and rely on the RLS policies in the migration.
5. Deploy the Vite web app to Vercel. Webhook validation and command workers
   belong in Supabase Edge Functions or a separate worker service, not in the
   browser bundle.

## Important boundary

Vercel is appropriate for the web application and short API requests. The
future isolated Airbnb browser executor needs a dedicated, long-lived worker
environment with a sealed profile, evidence storage, write leases, and a kill
switch. It is intentionally outside the Vercel frontend deployment.

The migration creates no live Airbnb connection. It records the authorization
grant and browser-run states needed before such a connection can exist.
