/*
  ROI Analysis Module (Supabase-safe)

  Creates:
    - roi_calculations
    - revenue_streams
    - cost_streams
    - roi_templates
    - roi_scenarios

  Notes:
    - Uses gen_random_uuid() (pgcrypto) for IDs
    - References auth.users for created_by / approved_by
    - Soft-creates a minimal projects table if missing
    - Enables RLS with permissive policies for authenticated
*/

-- ─────────────────────────────────────────────────────────────────────────────
-- Extensions
-- ─────────────────────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;

-- Ensure a projects table exists (id only if you don’t already have one)
create table if not exists projects (
  id uuid primary key default gen_random_uuid()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROI Calculations
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists roi_calculations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,

  calculation_type text not null default 'quick'
    check (calculation_type in ('quick','detailed','comprehensive')),
  version integer not null default 1,
  status text not null default 'draft'
    check (status in ('draft','submitted','approved')),

  -- Revenue totals
  total_revenue_estimate numeric not null default 0,
  total_revenue_forecast numeric not null default 0,
  total_revenue_actual   numeric not null default 0,

  -- Cost totals
  total_costs_estimate numeric not null default 0,
  total_costs_forecast numeric not null default 0,
  total_costs_actual   numeric not null default 0,

  -- Calculated metrics
  margin_percentage numeric not null default 0,
  roi_percentage    numeric not null default 0,

  -- Approvals & audit
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table roi_calculations enable row level security;

create policy roi_calculations_select_auth
  on roi_calculations for select
  to authenticated using (true);

create policy roi_calculations_all_auth
  on roi_calculations for all
  to authenticated using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Revenue Streams
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists revenue_streams (
  id uuid primary key default gen_random_uuid(),
  roi_calculation_id uuid not null references roi_calculations(id) on delete cascade,

  category text not null check (
    category in (
      'ticketing_mains','ticketing_addons','cashless','access_accreditation',
      'wristbands_devices','plans_insurance','insights_data','commercial_modules'
    )
  ),
  item_name text not null,
  unit_price numeric not null default 0,
  quantity integer not null default 0,
  fee_percentage numeric not null default 0,
  performance_percentage numeric not null default 100,

  estimate_value  numeric not null default 0,
  forecast_value  numeric not null default 0,
  actual_value    numeric not null default 0,

  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table revenue_streams enable row level security;

create policy revenue_streams_select_auth
  on revenue_streams for select
  to authenticated using (true);

create policy revenue_streams_all_auth
  on revenue_streams for all
  to authenticated using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Cost Streams
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists cost_streams (
  id uuid primary key default gen_random_uuid(),
  roi_calculation_id uuid not null references roi_calculations(id) on delete cascade,

  category text not null check (category in ('hardware','staffing','logistics','development','misc')),
  item_name text not null,
  unit_cost numeric not null default 0,
  quantity integer not null default 0,
  days integer default 1,

  estimate_value  numeric not null default 0,
  forecast_value  numeric not null default 0,
  actual_value    numeric not null default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table cost_streams enable row level security;

create policy cost_streams_select_auth
  on cost_streams for select
  to authenticated using (true);

create policy cost_streams_all_auth
  on cost_streams for all
  to authenticated using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROI Templates
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists roi_templates (
  id uuid primary key default gen_random_uuid(),
  template_name text not null,
  event_type text not null,
  event_size text not null,
  revenue_presets jsonb not null default '{}'::jsonb,
  cost_presets    jsonb not null default '{}'::jsonb,
  is_custom boolean default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  constraint roi_templates_template_name_uk unique (template_name)
);

alter table roi_templates enable row level security;

create policy roi_templates_select_auth
  on roi_templates for select
  to authenticated using (true);

create policy roi_templates_all_auth
  on roi_templates for all
  to authenticated using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROI Scenarios
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists roi_scenarios (
  id uuid primary key default gen_random_uuid(),
  roi_calculation_id uuid not null references roi_calculations(id) on delete cascade,

  scenario_type text not null check (scenario_type in ('best','expected','worst')),
  attendance_variance        numeric default 0,
  adoption_rate_variance     numeric default 0,
  weather_impact             numeric default 0,
  technical_issues_allowance numeric default 0,
  currency_fluctuation       numeric default 0,

  created_at timestamptz default now()
);

alter table roi_scenarios enable row level security;

create policy roi_scenarios_select_auth
  on roi_scenarios for select
  to authenticated using (true);

create policy roi_scenarios_all_auth
  on roi_scenarios for all
  to authenticated using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index if not exists idx_roi_calculations_project_id on roi_calculations(project_id);
create index if not exists idx_roi_calculations_status     on roi_calculations(status);
create index if not exists idx_revenue_streams_calc_id     on revenue_streams(roi_calculation_id);
create index if not exists idx_cost_streams_calc_id        on cost_streams(roi_calculation_id);
create index if not exists idx_roi_scenarios_calc_id       on roi_scenarios(roi_calculation_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed ROI Templates (safe: no created_by, unique constraint guards duplicates)
-- ─────────────────────────────────────────────────────────────────────────────
insert into roi_templates (template_name, event_type, event_size, revenue_presets, cost_presets)
values
  (
    'Conference Template - Small',
    'Conference',
    'Small (500-1000)',
    '{
      "ticketing_mains": [
        {"name":"General Admission","price":50,"capacity":800,"fee":10,"performance":85}
      ],
      "cashless": [
        {"name":"Transaction Fee","price":0.25,"transactions":5000,"fee":100,"performance":90}
      ]
    }'::jsonb,
    '{
      "hardware":[{"name":"Scanners","cost":50,"quantity":5,"days":3}],
      "staffing":[{"name":"Technical Support","cost":200,"quantity":2,"days":3}]
    }'::jsonb
  ),
  (
    'Festival Template - Medium',
    'Festival',
    'Medium (1000-5000)',
    '{
      "ticketing_mains": [
        {"name":"General Admission","price":75,"capacity":3000,"fee":10,"performance":90}
      ],
      "wristbands_devices": [
        {"name":"Generic Wristbands","price":2,"quantity":3500,"fee":100,"performance":95}
      ]
    }'::jsonb,
    '{
      "hardware":[{"name":"Wristbands","cost":1.5,"quantity":3500,"days":1}],
      "staffing":[{"name":"Event Crew","cost":150,"quantity":8,"days":4}]
    }'::jsonb
  )
on conflict (template_name) do nothing;