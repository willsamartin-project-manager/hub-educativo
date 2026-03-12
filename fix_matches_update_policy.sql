-- FIX: Allow users to UPDATE their own matches
-- Needed for the "Live Leaderboard" feature where we create a match first (score 0), 
-- and then update it when the game finishes.

-- 1. Enable RLS (just in case)
alter table matches enable row level security;

-- 2. Create UPDATE policy
drop policy if exists "Users can update their own matches." on matches;
create policy "Users can update their own matches." on matches
  for update using (auth.uid() = user_id);

-- 3. Verify Insert Policy (Make sure it still exists)
drop policy if exists "Users can insert their own matches." on matches;
create policy "Users can insert their own matches." on matches
  for insert with check (auth.uid() = user_id);

-- 4. Verify Select Policy
drop policy if exists "Public matches are viewable by everyone." on matches;
create policy "Public matches are viewable by everyone." on matches
  for select using (true);
