insert into public.profiles (id, full_name, role)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1)),
  'staff'
from auth.users
on conflict (id) do nothing;