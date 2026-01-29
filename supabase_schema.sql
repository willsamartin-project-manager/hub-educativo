-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  grade text,
  coins integer default 500, -- User starts with 500 coins
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for storing generated/played decks
create table decks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  subject text not null,
  grade_level text not null,
  questions jsonb not null, -- Stores the questions array
  score integer, -- Null if not played yet
  status text default 'created', -- created, completed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table decks enable row level security;

create policy "Users can view their own decks." on decks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own decks." on decks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own decks." on decks
  for update using (auth.uid() = user_id);

-- Function to handle new user signup automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, grade, coins)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'Ensino Médio', -- Default or extract from metadata if added later
    500
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
