-- ============================================================
-- NO RISK NO FUN 2026 — COMPLOT UITNODIGINGEN (accept/decline)
-- ------------------------------------------------------------
-- Pending uitnodigingen voor BESTAANDE spelers. Een haantje nodigt uit →
-- pending rij; de invitee accepteert (→ wordt lid) of weigert.
-- Niet-spelers lopen NIET via deze tabel maar via de invite-link/e-mail.
-- ============================================================

create table if not exists public.complot_invites (
  id         uuid default gen_random_uuid() primary key,
  group_id   uuid references public.complot_groups(id) on delete cascade,
  inviter_id uuid references public.profiles(id) on delete set null,
  invitee_id uuid references public.profiles(id) on delete cascade,
  status     text not null default 'pending',   -- pending | accepted | declined
  created_at timestamptz default now(),
  unique(group_id, invitee_id)
);

alter table public.complot_invites enable row level security;

drop policy if exists "ci_read"   on public.complot_invites;
drop policy if exists "ci_insert" on public.complot_invites;
drop policy if exists "ci_update" on public.complot_invites;
drop policy if exists "ci_delete" on public.complot_invites;

-- Iedereen mag lezen (consistent met de andere complot-tabellen).
create policy "ci_read" on public.complot_invites for select using (true);

-- Alleen een haantje van de groep mag uitnodigen.
create policy "ci_insert" on public.complot_invites for insert
  with check (
    exists (
      select 1 from public.complot_members cm
      where cm.group_id = complot_invites.group_id
        and cm.user_id = auth.uid()
        and cm.is_haantje = true
    )
  );

-- Invitee mag z'n eigen uitnodiging bijwerken (accept/decline); inviter/haantje mag annuleren.
create policy "ci_update" on public.complot_invites for update
  using (
    invitee_id = auth.uid()
    or inviter_id = auth.uid()
    or exists (
      select 1 from public.complot_members cm
      where cm.group_id = complot_invites.group_id
        and cm.user_id = auth.uid()
        and cm.is_haantje = true
    )
  );

-- Inviter of haantje mag verwijderen.
create policy "ci_delete" on public.complot_invites for delete
  using (
    inviter_id = auth.uid()
    or exists (
      select 1 from public.complot_members cm
      where cm.group_id = complot_invites.group_id
        and cm.user_id = auth.uid()
        and cm.is_haantje = true
    )
  );
