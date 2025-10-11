/*
  Add/Backfill project_code on projects (Supabase-safe)

  - Ensures required columns exist: event_location, project_code, created_at
  - Adds unique index on project_code (nullable)
  - Provides helper functions:
      get_region_code(text) -> text
      generate_project_code(text) -> text
  - Backfills missing project_code values
*/

create extension if not exists pgcrypto;

-- Ensure the projects table exists (minimal fallback; NOOP if you already have one)
create table if not exists projects (
  id uuid primary key default gen_random_uuid()
);

-- Ensure required columns exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'created_at'
  ) then
    alter table projects add column created_at timestamptz not null default now();
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'event_location'
  ) then
    alter table projects add column event_location text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'project_code'
  ) then
    alter table projects add column project_code text;
  end if;
end$$;

-- Unique index (nullable column, so use a partial index)
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public' and indexname = 'projects_project_code_uk'
  ) then
    create unique index projects_project_code_uk
      on projects (project_code)
      where project_code is not null;
  end if;
end$$;

-- Helper: Map event_location -> region code
create or replace function get_region_code(p_location text)
returns text
language sql
stable
as $$
  select
    case
      when p_location is null or btrim(p_location) = '' then 'XX'
      when p_location ilike '%united kingdom%' or p_location ilike '%uk%' or p_location ilike '%england%' or p_location ilike '%scotland%' or p_location ilike '%wales%' or p_location ilike '%northern ireland%' then 'UK'
      when p_location ilike '%ireland%' then 'IE'
      when p_location ilike '%spain%' then 'ES'
      when p_location ilike '%portugal%' then 'PT'
      when p_location ilike '%france%' then 'FR'
      when p_location ilike '%germany%' then 'DE'
      when p_location ilike '%netherlands%' or p_location ilike '%holland%' then 'NL'
      when p_location ilike '%belgium%' then 'BE'
      when p_location ilike '%italy%' then 'IT'
      when p_location ilike '%united states%' or p_location ilike '%usa%' or p_location ilike '%u.s.%' then 'US'
      when p_location ilike '%canada%' then 'CA'
      else 'XX'
    end;
$$;

-- Sequence for generating incremental codes (shared across regions; simple & safe)
do $$
begin
  if not exists (
    select 1 from pg_class where relkind = 'S' and relname = 'projects_code_seq'
  ) then
    create sequence projects_code_seq start 1 increment 1 minvalue 1;
  end if;
end$$;

-- Helper: Build code like REG-YYYY-0001
create or replace function generate_project_code(p_region text)
returns text
language plpgsql
volatile
as $$
declare
  v_region text := coalesce(nullif(btrim(p_region), ''), 'XX');
  v_seq bigint;
begin
  select nextval('projects_code_seq') into v_seq;
  return format('%s-%s-%s', v_region, to_char(now(), 'YYYY'), lpad(v_seq::text, 4, '0'));
end;
$$;

-- Backfill missing codes (skip rows we can't infer a region for)
do $$
declare
  r record;
  v_region text;
  v_code text;
begin
  for r in
    select id, event_location
    from projects
    where project_code is null
    order by created_at nulls first, id
  loop
    v_region := get_region_code(r.event_location);
    -- If we still don't have a sensible region, default to 'XX'
    if v_region is null or v_region = '' then
      v_region := 'XX';
    end if;

    v_code := generate_project_code(v_region);

    -- Insert code; on unique violation (extremely unlikely), retry once
    begin
      update projects
      set project_code = v_code
      where id = r.id;
    exception when unique_violation then
      v_code := generate_project_code(v_region);
      update projects
      set project_code = v_code
      where id = r.id;
    end;
  end loop;
end
$$;