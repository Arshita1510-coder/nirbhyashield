-- NirbhayaShield — Initial PostgreSQL Schema & RLS Setup

-- Enable PostGIS spatial query extension
create extension if not exists postgis;

-- 1. Trusted Contacts Table
create table if not exists trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  name text not null,
  phone text not null,
  share_level text check (share_level in ('location_only','location_audio')) default 'location_only',
  created_at timestamptz default now()
);

-- 2. SOS Sessions Table
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

-- 3. SOS Locations Breadcrumb Table
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

-- Trigger to auto-populate geography column from lat/lng
create or replace function update_sos_location_geom()
returns trigger as $$
begin
  new.geom := st_setsrid(st_makePoint(new.lng, new.lat), 4326)::geography;
  return new;
end;
$$ language plpgsql;

create trigger trg_sos_locations_geom
before insert or update on sos_locations
for each row execute function update_sos_location_geom();

-- 4. Safe Points Table (Police Stations, Pink Booths, Hospitals, Pharmacies)
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

-- 5. Transit Check-ins Table
create table if not exists transit_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  vehicle_id text not null,
  route_name text,
  status text check (status in ('active','completed','alert')) default 'active',
  checked_in_at timestamptz default now(),
  completed_at timestamptz
);

-- 6. Scam Checks Table
create table if not exists scam_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  job_text text,
  interview_address text,
  risk_level text check (risk_level in ('low','moderate','high')) default 'low',
  reasons jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 7. Interview Safety Check-ins Table
create table if not exists interview_checkins (
  id uuid primary key default gen_random_uuid(),
  scam_check_id uuid references scam_checks on delete cascade,
  user_id uuid references auth.users not null,
  scheduled_at timestamptz not null,
  duration_minutes int default 60,
  status text check (status in ('pending','checked_in','missed','escalated')) default 'pending',
  created_at timestamptz default now()
);

-- 8. Crowdsourced Safety Reports Table
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

-- Row Level Security (RLS) Policies

alter table trusted_contacts enable row level security;
alter table sos_sessions enable row level security;
alter table sos_locations enable row level security;
alter table safe_points enable row level security;
alter table transit_checkins enable row level security;
alter table scam_checks enable row level security;
alter table interview_checkins enable row level security;
alter table safety_reports enable row level security;

-- trusted_contacts RLS
create policy "Public access trusted contacts"
on trusted_contacts for all using (true) with check (true);

-- sos_sessions RLS
create policy "Public access sos sessions"
on sos_sessions for all using (true) with check (true);

-- sos_locations RLS
create policy "Public access sos locations"
on sos_locations for all using (true) with check (true);

-- safe_points RLS (Public Read, Admin Write)
create policy "Public can view safe points"
on safe_points for select using (true);

-- transit_checkins RLS
create policy "Users manage their transit checkins"
on transit_checkins for all using (auth.uid() = user_id);

-- scam_checks RLS
create policy "Users view their scam checks"
on scam_checks for all using (auth.uid() = user_id or user_id is null);

-- interview_checkins RLS
create policy "Users manage their interview checkins"
on interview_checkins for all using (auth.uid() = user_id);

-- safety_reports RLS
create policy "Public read safety reports"
on safety_reports for select using (true);

create policy "Users insert safety reports"
on safety_reports for insert with check (true);

-- Security-definer RPC function for tokenized public tracking without bypass of RLS
create or replace function get_public_sos_tracking(p_tracking_token uuid)
returns table (
  session_id uuid,
  status text,
  trigger_type text,
  started_at timestamptz,
  resolved_at timestamptz,
  latest_lat double precision,
  latest_lng double precision,
  latest_battery int,
  latest_speed double precision,
  recorded_at timestamptz,
  audio_vault_path text
) security definer as $$
begin
  return query
  select 
    s.id as session_id,
    s.status,
    s.trigger_type,
    s.started_at,
    s.resolved_at,
    l.lat as latest_lat,
    l.lng as latest_lng,
    l.battery_pct as latest_battery,
    l.speed as latest_speed,
    l.recorded_at,
    s.audio_vault_path
  from sos_sessions s
  left join lateral (
    select lat, lng, battery_pct, speed, recorded_at
    from sos_locations
    where session_id = s.id
    order by recorded_at desc
    limit 1
  ) l on true
  where s.tracking_token = p_tracking_token;
end;
$$ language plpgsql;

-- PostGIS Nearby Safe Points Query Function
create or replace function get_nearby_safe_points(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision default 5000
)
returns table (
  id uuid,
  name text,
  category text,
  lat double precision,
  lng double precision,
  address text,
  distance_meters double precision
) language plpgsql as $$
begin
  return query
  select 
    sp.id,
    sp.name,
    sp.category,
    sp.lat,
    sp.lng,
    sp.address,
    st_distance(
      sp.geom,
      st_setsrid(st_makePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters
  from safe_points sp
  where st_dwithin(
    sp.geom,
    st_setsrid(st_makePoint(user_lng, user_lat), 4326)::geography,
    radius_meters
  )
  order by distance_meters asc;
end;
$$;

-- PostGIS Route Deviation Distance Math Function
create or replace function check_route_deviation(
  current_lat double precision,
  current_lng double precision,
  route_linestring text,
  threshold_meters double precision default 100
)
returns boolean language plpgsql as $$
declare
  user_point geography;
  route_geom geography;
  dist_meters double precision;
begin
  user_point := st_setsrid(st_makePoint(current_lng, current_lat), 4326)::geography;
  route_geom := st_geogfromtext(route_linestring);
  dist_meters := st_distance(user_point, route_geom);

  return dist_meters > threshold_meters;
end;
$$;

-- Phase 4: Automated Missed Interview Check-in Escalation via pg_cron
create extension if not exists pg_cron;

create or replace function escalate_missed_interview_checkins()
returns void language plpgsql security definer as $$
declare
  r record;
begin
  for r in 
    select id, user_id from interview_checkins
    where status = 'pending'
    and now() > (scheduled_at + (duration_minutes || ' minutes')::interval)
  loop
    -- Update status to missed
    update interview_checkins set status = 'missed' where id = r.id;
    
    -- Auto-trigger SOS session for missed check-in
    insert into sos_sessions (user_id, status, trigger_type)
    values (r.user_id, 'active', 'scam_timer');
  end loop;
end;
$$;

-- Enable Realtime Subscriptions on key tables
alter publication supabase_realtime add table sos_sessions;
alter publication supabase_realtime add table sos_locations;
