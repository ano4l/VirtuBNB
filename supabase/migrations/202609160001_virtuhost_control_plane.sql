-- VirtuHost control-plane foundation.
-- Apply through the Supabase CLI or dashboard only after reviewing the target
-- project, region, backup policy, and authentication settings.

create extension if not exists pgcrypto;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 160),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'operations', 'service_provider')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 160),
  timezone text not null default 'Africa/Johannesburg',
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.authorization_grants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  granted_by uuid not null references auth.users(id),
  platform text not null check (platform in ('airbnb')),
  status text not null default 'draft' check (status in ('draft', 'active', 'revoked', 'expired')),
  permitted_actions jsonb not null default '[]'::jsonb,
  property_scope jsonb not null default '[]'::jsonb,
  expires_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agent_commands (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  submitted_by uuid references auth.users(id),
  origin text not null check (origin in ('web', 'whatsapp', 'worker')),
  idempotency_key text not null check (char_length(idempotency_key) between 16 and 256),
  instruction text not null check (char_length(trim(instruction)) between 1 and 4096),
  status text not null check (status in ('received', 'planning', 'proposed', 'awaiting_approval', 'executing', 'verified', 'failed', 'cancelled')),
  proposal jsonb,
  policy_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, idempotency_key)
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  command_id uuid not null references public.agent_commands(id) on delete cascade,
  requested_by uuid references auth.users(id),
  decided_by uuid references auth.users(id),
  proposal_version integer not null check (proposal_version > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired', 'revoked')),
  expires_at timestamptz not null,
  decision_note text check (char_length(decision_note) <= 2000),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (command_id, proposal_version)
);

create table public.whatsapp_inbox (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  provider_message_id text not null unique,
  sender_hash text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

create table public.whatsapp_outbox (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  command_id uuid references public.agent_commands(id) on delete set null,
  idempotency_key text not null unique,
  recipient_hash text not null,
  body text not null check (char_length(body) between 1 and 4096),
  status text not null default 'pending' check (status in ('pending', 'leased', 'sent', 'failed', 'dead_letter')),
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.browser_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  command_id uuid not null references public.agent_commands(id) on delete cascade,
  authorization_grant_id uuid not null references public.authorization_grants(id),
  status text not null check (status in ('queued', 'baseline_read', 'executing', 'verification_read', 'verified', 'mismatch', 'failed', 'cancelled')),
  evidence_manifest jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  command_id uuid references public.agent_commands(id) on delete set null,
  event_type text not null check (char_length(event_type) between 1 and 120),
  event_data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index agent_commands_organization_created_idx on public.agent_commands (organization_id, created_at desc);
create index approvals_organization_status_idx on public.approvals (organization_id, status, expires_at);
create index whatsapp_outbox_pending_idx on public.whatsapp_outbox (status, next_attempt_at) where status in ('pending', 'leased', 'failed');
create index audit_events_organization_occurred_idx on public.audit_events (organization_id, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at before update on public.organizations for each row execute function public.set_updated_at();
create trigger properties_set_updated_at before update on public.properties for each row execute function public.set_updated_at();
create trigger authorization_grants_set_updated_at before update on public.authorization_grants for each row execute function public.set_updated_at();
create trigger agent_commands_set_updated_at before update on public.agent_commands for each row execute function public.set_updated_at();

create or replace function public.is_organization_member(target_organization uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_memberships
    where organization_id = target_organization and user_id = auth.uid()
  );
$$;

create or replace function public.has_organization_role(target_organization uuid, allowed_roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_memberships
    where organization_id = target_organization
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

-- The only browser-accessible bootstrap path. Subsequent membership changes
-- are performed by a server-side administration workflow.
create or replace function public.create_organization(organization_name text)
returns public.organizations language plpgsql security definer set search_path = public as $$
declare
  created_organization public.organizations;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  insert into public.organizations (name) values (organization_name) returning * into created_organization;
  insert into public.organization_memberships (organization_id, user_id, role)
  values (created_organization.id, auth.uid(), 'owner');
  return created_organization;
end;
$$;

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.properties enable row level security;
alter table public.authorization_grants enable row level security;
alter table public.agent_commands enable row level security;
alter table public.approvals enable row level security;
alter table public.whatsapp_inbox enable row level security;
alter table public.whatsapp_outbox enable row level security;
alter table public.browser_runs enable row level security;
alter table public.audit_events enable row level security;

revoke all on public.organizations, public.organization_memberships, public.properties,
  public.authorization_grants, public.agent_commands, public.approvals,
  public.whatsapp_inbox, public.whatsapp_outbox, public.browser_runs,
  public.audit_events from anon;
revoke all on public.whatsapp_inbox, public.whatsapp_outbox, public.browser_runs, public.audit_events from authenticated;
grant select on public.organizations, public.organization_memberships, public.properties, public.authorization_grants, public.agent_commands, public.approvals to authenticated;
grant insert on public.agent_commands to authenticated;
grant update on public.approvals to authenticated;
grant execute on function public.create_organization(text) to authenticated;

create policy "members read organizations" on public.organizations for select to authenticated using (public.is_organization_member(id));
create policy "members read memberships" on public.organization_memberships for select to authenticated using (user_id = auth.uid() or public.has_organization_role(organization_id, array['owner', 'manager']));
create policy "members read properties" on public.properties for select to authenticated using (public.is_organization_member(organization_id));
create policy "members read grants" on public.authorization_grants for select to authenticated using (public.has_organization_role(organization_id, array['owner', 'manager']));
create policy "members read commands" on public.agent_commands for select to authenticated using (public.is_organization_member(organization_id));
create policy "members submit commands" on public.agent_commands for insert to authenticated with check (public.is_organization_member(organization_id) and submitted_by = auth.uid() and origin = 'web' and status = 'received');
create policy "members read approvals" on public.approvals for select to authenticated using (public.is_organization_member(organization_id));
create policy "managers decide pending approvals" on public.approvals for update to authenticated using (status = 'pending' and public.has_organization_role(organization_id, array['owner', 'manager'])) with check (status in ('approved', 'rejected') and decided_by = auth.uid() and decided_at is not null);

-- No browser role can read or write inbox/outbox, evidence, or audit rows.
-- Edge Functions/workers use a server-only secret and must still explicitly
-- verify organization membership and authorization-grant scope.
