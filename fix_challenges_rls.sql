-- SAFE FIX SCRIPT
-- This script safely checks for policies and columns and adds them if missing.

-- 1. Enable RLS on challenges (idempotent)
alter table challenges enable row level security;

-- 2. Drop existing policies to avoid conflicts, then recreate them
drop policy if exists "Public challenges are viewable by everyone." on challenges;
create policy "Public challenges are viewable by everyone." on challenges
  for select using (true);

drop policy if exists "Users can create challenges." on challenges;
create policy "Users can create challenges." on challenges
  for insert with check (auth.uid() = creator_id);

-- 3. Add challenge_id to matches if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'matches' and column_name = 'challenge_id') then
        alter table matches add column challenge_id uuid references challenges(id);
    end if;
end $$;
