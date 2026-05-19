-- ============================================================
-- COMPLOT TABELLEN FIX
-- Run dit in een nieuwe SQL tab
-- ============================================================

-- Stap 1: groepen tabel zonder de problematische policy
create table if not exists public.complot_groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  invite_code text unique not null default substring(md5(random()::text) from 1 for 8),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.complot_groups enable row level security;

drop policy if exists "cg_read" on public.complot_groups;
drop policy if exists "cg_insert" on public.complot_groups;
drop policy if exists "cg_update" on public.complot_groups;
drop policy if exists "cg_delete" on public.complot_groups;

create policy "cg_read" on public.complot_groups for select using (true);
create policy "cg_insert" on public.complot_groups for insert with check (auth.uid() = created_by);
create policy "cg_delete" on public.complot_groups for delete using (auth.uid() = created_by);

-- Stap 2: leden tabel (MOET na groepen tabel)
create table if not exists public.complot_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.complot_groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  is_haantje boolean default false,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

alter table public.complot_members enable row level security;

drop policy if exists "cm_read" on public.complot_members;
drop policy if exists "cm_insert" on public.complot_members;
drop policy if exists "cm_update" on public.complot_members;
drop policy if exists "cm_delete" on public.complot_members;

create policy "cm_read" on public.complot_members for select using (true);
create policy "cm_insert" on public.complot_members for insert
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.complot_members cm2
      where cm2.group_id = complot_members.group_id
        and cm2.user_id = auth.uid()
        and cm2.is_haantje = true
    )
  );
create policy "cm_update" on public.complot_members for update
  using (
    exists (
      select 1 from public.complot_members cm2
      where cm2.group_id = complot_members.group_id
        and cm2.user_id = auth.uid()
        and cm2.is_haantje = true
    )
  );
create policy "cm_delete" on public.complot_members for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.complot_members cm2
      where cm2.group_id = complot_members.group_id
        and cm2.user_id = auth.uid()
        and cm2.is_haantje = true
    )
  );

-- Stap 3: nu pas de update policy op groepen (verwijst naar leden tabel)
create policy "cg_update" on public.complot_groups for update
  using (exists (
    select 1 from public.complot_members
    where group_id = id
      and user_id = auth.uid()
      and is_haantje = true
  ));
