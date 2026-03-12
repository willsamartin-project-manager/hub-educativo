-- 1. Create Transactions Table (Safe)
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  amount numeric not null,
  coins int not null,
  status text not null default 'pending', -- pending, approved, rejected
  provider_id text, -- ID do pagamento no Mercado Pago
  qr_code text,
  qr_code_base64 text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Add RLS Policies (Idempotent)
alter table transactions enable row level security;

-- Drop policy if it exists to prevent errors on re-run
drop policy if exists "Users can view own transactions" on transactions;

create policy "Users can view own transactions"
  on transactions for select
  using ( auth.uid() = user_id );

-- 3. Create RPC to safely add coins
-- Updated to use 'coins' column instead of 'credits' to match frontend usage
create or replace function add_coins(user_id uuid, coins_to_add int)
returns void
language plpgsql
security definer -- Runs with admin privileges
as $$
begin
  update public.profiles
  set coins = coalesce(coins, 0) + coins_to_add
  where id = add_coins.user_id;
end;
$$;
