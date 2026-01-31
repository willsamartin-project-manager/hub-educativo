-- Create challenges table to link users to a specific deck contest
create table challenges (
  id uuid default gen_random_uuid() primary key,
  deck_id uuid references decks(id) not null,
  creator_id uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table challenges enable row level security;

-- Policies
create policy "Public challenges are viewable by everyone." on challenges
  for select using (true);

create policy "Users can create challenges." on challenges
  for insert with check (auth.uid() = creator_id);

-- Add challenge_id to matches to link a gameplay result to a specific challenge
alter table matches
add column challenge_id uuid references challenges(id);
