-- RakshaShield — Idempotent Safe PostgreSQL Migration Script

-- 1. Enable PostGIS spatial query extension
create extension if not exists postgis;

-- 2. Core Tables Definitions

create table if not exists trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  name text not null,
  phone text not null,
  share_level text check (share_level in ('location_only','location_audio')) default 'location_only',
  created_at timestamptz default now()
);

create table if not exists sos_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  status text check (status in ('active','resolved','false_alarm')) default 'active',
  trigger_type text check (trigger_type in ('button','shake','voice','pin','route_deviation','transit','scam_timer')),
  vehicle_id text,
  tracking_token uuid default gen_random_uuid() not null unique,
  audio_vault_path text,
  started_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists sos_locations (
  id bigint generated always as identity primary key,
  session_id uuid references sos_sessions on delete cascade not null,
  lat double precision not null,
  lng double precision not null,
  battery_pct int check (battery_pct between 0 and 100),
  speed double precision default 0,
  geom geography(Point, 4326),
  recorded_at timestamptz default now()
);

create table if not exists safe_points (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text check (category in ('police','pink_booth','hospital','pharmacy','illuminated_zone')) default 'police',
  lat double precision not null,
  lng double precision not null,
  address text,
  geom geography(Point, 4326),
  verified boolean default true,
  created_at timestamptz default now()
);

create table if not exists transit_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  vehicle_id text not null,
  route_name text,
  status text check (status in ('active','completed','alert')) default 'active',
  checked_in_at timestamptz default now(),
  completed_at timestamptz
);

create table if not exists scam_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  job_text text,
  interview_address text,
  risk_level text check (risk_level in ('low','moderate','high')) default 'low',
  reasons jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists interview_checkins (
  id uuid primary key default gen_random_uuid(),
  scam_check_id uuid references scam_checks on delete cascade,
  user_id uuid references auth.users,
  scheduled_at timestamptz not null,
  duration_minutes int default 60,
  status text check (status in ('pending','checked_in','missed','escalated')) default 'pending',
  created_at timestamptz default now()
);

create table if not exists safety_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  category text check (category in ('poor_lighting','harassment','isolated','suspicious_activity','unmonitored')),
  description text,
  lat double precision not null,
  lng double precision not null,
  severity text check (severity in ('low','medium','high')) default 'medium',
  geom geography(Point, 4326),
  created_at timestamptz default now()
);

-- 3. Make user_id optional for demo mode
alter table if exists trusted_contacts alter column user_id drop not null;
alter table if exists sos_sessions alter column user_id drop not null;
alter table if exists transit_checkins alter column user_id drop not null;
alter table if exists interview_checkins alter column user_id drop not null;

-- 4. Enable RLS
alter table trusted_contacts enable row level security;
alter table sos_sessions enable row level security;
alter table sos_locations enable row level security;
alter table safe_points enable row level security;
alter table transit_checkins enable row level security;
alter table scam_checks enable row level security;
alter table interview_checkins enable row level security;
alter table safety_reports enable row level security;

-- 5. Safe Policy Updates (Drops old policies if present to avoid 42710 error)
drop policy if exists "Users manage their own trusted contacts" on trusted_contacts;
drop policy if exists "Public access trusted contacts" on trusted_contacts;
create policy "Public access trusted contacts" on trusted_contacts for all using (true) with check (true);

drop policy if exists "Users manage their own sos sessions" on sos_sessions;
drop policy if exists "Public access sos sessions" on sos_sessions;
create policy "Public access sos sessions" on sos_sessions for all using (true) with check (true);

drop policy if exists "Users manage location data of their sessions" on sos_locations;
drop policy if exists "Public access sos locations" on sos_locations;
create policy "Public access sos locations" on sos_locations for all using (true) with check (true);

drop policy if exists "Users manage their transit checkins" on transit_checkins;
drop policy if exists "Public access transit checkins" on transit_checkins;
create policy "Public access transit checkins" on transit_checkins for all using (true) with check (true);

drop policy if exists "Public can view safe points" on safe_points;
create policy "Public can view safe points" on safe_points for select using (true);

drop policy if exists "Users view their scam checks" on scam_checks;
create policy "Users view their scam checks" on scam_checks for all using (true) with check (true);

drop policy if exists "Users manage their interview checkins" on interview_checkins;
create policy "Public access interview checkins" on interview_checkins for all using (true) with check (true);

drop policy if exists "Public read safety reports" on safety_reports;
create policy "Public read safety reports" on safety_reports for all using (true) with check (true);
