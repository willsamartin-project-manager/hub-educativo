-- Run this once to create profiles for users who signed up BEFORE the trigger existed
insert into public.profiles (id, full_name, grade, coins)
select 
  id, 
  coalesce(raw_user_meta_data->>'full_name', 'Estudante'), 
  'Ensino Médio', 
  500
from auth.users 
where id not in (select id from public.profiles);
