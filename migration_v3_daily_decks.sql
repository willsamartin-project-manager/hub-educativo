-- Add Daily Deck columns
alter table decks 
add column is_daily boolean default false,
add column daily_date date unique;

-- Make owner_id nullable for system decks
alter table decks alter column owner_id drop not null;

-- Index for fast lookup
create index if not exists idx_decks_daily_date on decks(daily_date);

-- Policy to allow anyone (public) to READ the daily deck
create policy "Public can view daily decks" 
on decks for select 
using (is_daily = true);

-- Policy to allow INSERTing daily decks (Rate limited by Unique Key on date)
-- This allows the API (as anon) to insert the daily deck.
-- We ensure validity via the API logic, but at DB level we just allow it if is_daily is set.
create policy "Public can insert daily decks" 
on decks for insert 
with check (is_daily = true);
