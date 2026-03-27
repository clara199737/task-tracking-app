-- Sales pipeline deals table
create table deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text,
  contact_name text,
  value decimal,
  stage text not null default 'lead'
    check (stage in ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  close_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: each user sees only their own deals
alter table deals enable row level security;

create policy "Users can view own deals"
  on deals for select using (auth.uid() = user_id);

create policy "Users can insert own deals"
  on deals for insert with check (auth.uid() = user_id);

create policy "Users can update own deals"
  on deals for update using (auth.uid() = user_id);

create policy "Users can delete own deals"
  on deals for delete using (auth.uid() = user_id);

create index idx_deals_user_stage on deals(user_id, stage);
create index idx_deals_updated_at on deals(updated_at desc);
