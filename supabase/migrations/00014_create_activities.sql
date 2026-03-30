create table activities (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references deals(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  type          text not null check (type in ('call','email','meeting','note','stage_change')),
  notes         text,
  occurred_at   date not null default current_date,
  created_at    timestamptz not null default now()
);

alter table activities enable row level security;

create policy "Users manage their own activities"
  on activities for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
