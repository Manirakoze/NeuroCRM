create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)), 'staff')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create function public.get_public_enrollment_link(enrollment_link_id uuid)
returns table (id uuid, program text)
language sql
stable
security definer
set search_path = public
as $$
  select id, program
  from public.enrollment_links
  where id = enrollment_link_id and active = true;
$$;

revoke all on function public.get_public_enrollment_link(uuid) from public;
grant execute on function public.get_public_enrollment_link(uuid) to anon, authenticated;