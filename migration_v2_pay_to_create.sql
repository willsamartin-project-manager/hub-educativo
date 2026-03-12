-- Refactor: Split Decks (Asset) and Matches (History)

-- 1. Modify Decks Table (Remove gameplay data, keep content)
-- We drop and recreate for cleanliness in MVP, assuming no critical data yet.
drop table if exists decks cascade;

create table decks (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  title text not null, -- Ex: "Rev. Francesa - Médio"
  subject text not null, -- Ex: "História"
  grade text not null,
  questions jsonb not null, -- The asset content
  cost integer default 50, -- How much it cost to create (for history)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Decks
alter table decks enable row level security;
create policy "Users can view their own decks." on decks for select using (auth.uid() = owner_id);
create policy "Users can insert their own decks." on decks for insert with check (auth.uid() = owner_id);

-- 2. Create Matches Table (Gameplay History)
create table matches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  deck_id uuid references decks(id) on delete cascade not null,
  score integer not null,
  max_score integer not null, -- To calculate percentage later
  played_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Matches
alter table matches enable row level security;
create policy "Users can view their own matches." on matches for select using (auth.uid() = user_id);
create policy "Users can insert their own matches." on matches for insert with check (auth.uid() = user_id);

-- 3. Stored Procedure for Safe Deck Purchase (Atomic Transaction)
-- This ensures that coins are deducted AND deck is created in one go.
create or replace function purchase_deck(
  p_owner_id uuid,
  p_title text,
  p_subject text,
  p_grade text,
  p_questions jsonb,
  p_cost integer
) returns uuid as $$
declare
  v_new_deck_id uuid;
  v_user_coins integer;
begin
  -- Check Balance
  select coins into v_user_coins from profiles where id = p_owner_id;
  
  if v_user_coins < p_cost then
    raise exception 'Saldo insuficiente (Tem: %, Precisa: %)', v_user_coins, p_cost;
  end if;

  -- Deduct Coins
  update profiles set coins = coins - p_cost where id = p_owner_id;

  -- Create Deck
  insert into decks (owner_id, title, subject, grade, questions, cost)
  values (p_owner_id, p_title, p_subject, p_grade, p_questions, p_cost)
  returning id into v_new_deck_id;

  return v_new_deck_id;
end;
$$ language plpgsql security definer;
