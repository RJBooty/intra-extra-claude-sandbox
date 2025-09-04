-- Enable pgcrypto for gen_random_uuid() if not already
create extension if not exists pgcrypto;

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optional: RLS
alter table projects enable row level security;

-- Minimal permissive policies while you iterate (tighten later)
do $$
begin
  if not exists (select 1 from pg_policies where polname = 'projects_select_all') then
    create policy projects_select_all on projects for select using (true);
  end if;
  if not exists (select 1 from pg_policies where polname = 'projects_insert_auth') then
    create policy projects_insert_auth on projects for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where polname = 'projects_update_owner') then
    create policy projects_update_owner on projects for update using (auth.uid() = created_by);
  end if;
end$$;