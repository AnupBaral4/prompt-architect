-- Scans table: stores every AI-visibility scan result.
-- No anon SELECT/INSERT policies on purpose. All access goes through the
-- Edge Functions (scan / get-scan), which use the service role key.
-- This avoids exposing the raw table via PostgREST, so scan history can't
-- be enumerated by anyone poking at the public API.

create table if not exists scans (
  id text primary key,                    -- short slug, e.g. "xk29pq1a", used in the permalink
  url text not null,
  score_overall integer not null,
  score_crawler_access integer not null,
  score_structured_data integer not null,
  score_content_visibility integer not null,
  details jsonb not null,                 -- full checklist: each check, pass/fail, why, fix
  created_at timestamptz not null default now()
);

alter table scans enable row level security;
-- No policies added = default deny for anon/authenticated roles.
-- Service role (used by Edge Functions) bypasses RLS entirely, which is what we want here.

create index if not exists scans_created_at_idx on scans (created_at desc);
