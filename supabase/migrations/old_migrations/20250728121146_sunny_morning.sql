/*
  Platform Configuration System (Supabase-safe)

  Creates:
    - platform_user_roles (stores app roles for auth.users)
    - helper functions: get_role_level(uuid), is_master(uuid), set_updated_at()
    - platform_fields, field_options, field_change_log, field_usage_tracking
  Notes:
    - References auth.users, not public.users
    - RLS enabled on all tables
    - Master-level manage policies, read for authenticated
*/

-- Extensions
create extension if not exists pgcrypto;

-- App roles storage (instead of altering auth.users)
create table if not exists platform_user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role_level text default 'user'
    check (role_level in ('master','senior','mid','external','hr','admin','user')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Role helpers
create or replace function get_role_level(p_user_id uuid)
returns text
language sql
stable
as $$
  select coalesce(
    (select role_level from platform_user_roles where user_id = p_user_id),
    'user'
  )
$$;

create or replace function is_master(p_user_id uuid)
returns boolean
language sql
stable
as $$
  select get_role_level(p_user_id) = 'master'
$$;

-- Core configuration tables
create table if not exists platform_fields (
  id uuid primary key default gen_random_uuid(),

  -- high-level grouping
  module text not null,              -- e.g. 'CRM', 'Projects', 'Operations'
  section text not null,             -- finer grouping, e.g. 'Project Form'

  -- identity
  field_key text not null,           -- unique key within a module+section
  display_name text not null,        -- human label
  description text default null,

  -- nature of field
  data_type text not null            -- 'text','number','date','datetime','boolean','select','multiselect','tag','json','currency','percent'
    check (data_type in ('text','number','date','datetime','boolean','select','multiselect','tag','json','currency','percent')),
  required boolean not null default false,
  default_value text default null,

  -- flags
  is_system boolean not null default false,          -- built-in by dev
  is_system_locked boolean not null default false,   -- cannot be edited at all
  is_custom boolean not null default false,          -- admin-created

  -- options meta
  has_options boolean not null default false,

  -- audit
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint platform_fields_module_section_key_uk unique (module, section, field_key)
);
create index if not exists idx_platform_fields_module_section
  on platform_fields(module, section);
create index if not exists idx_platform_fields_key
  on platform_fields(field_key);

-- Options for select/multiselect/tag fields
create table if not exists field_options (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references platform_fields(id) on delete cascade,

  option_value text not null,
  option_label text not null,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint field_options_field_value_uk unique (field_id, option_value)
);
create index if not exists idx_field_options_field_id
  on field_options(field_id);

-- Complete audit trail of field changes
create table if not exists field_change_log (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references platform_fields(id) on delete cascade,

  changed_by uuid references auth.users(id) on delete set null,
  change_type text not null
    check (change_type in ('create','update','delete','lock','unlock','option_add','option_update','option_delete')),
  old_value jsonb,
  new_value jsonb,

  changed_at timestamptz not null default now()
);
create index if not exists idx_field_change_log_field_id
  on field_change_log(field_id);
create index if not exists idx_field_change_log_changed_at
  on field_change_log(changed_at);

-- Usage tracking for analytics and safe deletes
create table if not exists field_usage_tracking (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references platform_fields(id) on delete cascade,

  used_in_module text not null,      -- where it is used (e.g. 'Projects')
  used_in_table text not null,       -- physical table name
  used_in_column text not null,      -- column name

  usage_count integer not null default 0,  -- cached counter
  last_detected_at timestamptz not null default now()
);
create index if not exists idx_field_usage_field_id
  on field_usage_tracking(field_id);
create index if not exists idx_field_usage_location
  on field_usage_tracking(used_in_module, used_in_table, used_in_column);

-- RLS
alter table platform_fields        enable row level security;
alter table field_options          enable row level security;
alter table field_change_log       enable row level security;
alter table field_usage_tracking   enable row level security;
alter table platform_user_roles    enable row level security;

-- Policies (duplicate-safe: catch duplicate_object)
do $$
begin
  begin
    create policy platform_fields_select_auth
      on platform_fields for select
      to authenticated using (true);
  exception when duplicate_object then null;
  end;

  begin
    create policy field_options_select_auth
      on field_options for select
      to authenticated using (true);
  exception when duplicate_object then null;
  end;

  begin
    create policy field_change_log_select_auth
      on field_change_log for select
      to authenticated using (true);
  exception when duplicate_object then null;
  end;

  begin
    create policy field_usage_tracking_select_auth
      on field_usage_tracking for select
      to authenticated using (true);
  exception when duplicate_object then null;
  end;

  begin
    create policy platform_user_roles_select_self_or_master
      on platform_user_roles for select
      to authenticated
      using (user_id = auth.uid() or is_master(auth.uid()));
  exception when duplicate_object then null;
  end;
end$$;

-- Manage rights: only master can insert/update/delete in config tables
do $$
begin
  begin
    create policy platform_fields_manage_master
      on platform_fields for all
      to authenticated
      using (is_master(auth.uid()))
      with check (is_master(auth.uid()));
  exception when duplicate_object then null;
  end;

  begin
    create policy field_options_manage_master
      on field_options for all
      to authenticated
      using (is_master(auth.uid()))
      with check (is_master(auth.uid()));
  exception when duplicate_object then null;
  end;

  begin
    create policy field_change_log_insert_master
      on field_change_log for insert
      to authenticated
      with check (is_master(auth.uid()));
  exception when duplicate_object then null;
  end;

  begin
    create policy field_usage_tracking_manage_master
      on field_usage_tracking for all
      to authenticated
      using (is_master(auth.uid()))
      with check (is_master(auth.uid()));
  exception when duplicate_object then null;
  end;

  begin
    create policy platform_user_roles_manage_master
      on platform_user_roles for all
      to authenticated
      using (is_master(auth.uid()))
      with check (is_master(auth.uid()));
  exception when duplicate_object then null;
  end;
end$$;

-- Helpful triggers to keep updated_at fresh
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_platform_fields_updated_at') then
    create trigger trg_platform_fields_updated_at
      before update on platform_fields
      for each row
      execute procedure set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_field_options_updated_at') then
    create trigger trg_field_options_updated_at
      before update on field_options
      for each row
      execute procedure set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_platform_user_roles_updated_at') then
    create trigger trg_platform_user_roles_updated_at
      before update on platform_user_roles
      for each row
      execute procedure set_updated_at();
  end if;
end$$;