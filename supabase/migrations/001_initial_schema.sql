create type public.client_status as enum ('Active', 'Waitlist', 'Inactive');
create type public.enrollment_status as enum ('Submitted', 'Reviewed', 'Accepted', 'Declined');

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  primary_contact_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  unique (email)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references public.families on delete set null,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  status public.client_status not null default 'Waitlist',
  notes text,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients on delete restrict,
  child_name text not null,
  from_date date not null,
  to_date date not null,
  hourly_rate numeric(10, 2) not null check (hourly_rate >= 0),
  total_hours numeric(10, 2) not null check (total_hours >= 0),
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  parent_name text not null,
  parent_email text,
  parent_phone text,
  parent_address text,
  financial_manager text,
  claim_reference text,
  notes text,
  entries jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.enrollment_links (
  id uuid primary key default gen_random_uuid(),
  program text not null,
  active boolean not null default true,
  created_by uuid references public.profiles on delete set null,
  created_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.enrollment_links on delete restrict,
  client_id uuid references public.clients on delete set null,
  parent_name text not null,
  parent_email text not null,
  parent_phone text,
  child_name text not null,
  program text not null,
  consent_at timestamptz not null,
  status public.enrollment_status not null default 'Submitted',
  submitted_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.clients enable row level security;
alter table public.reports enable row level security;
alter table public.enrollment_links enable row level security;
alter table public.enrollments enable row level security;

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'staff')); $$;

create policy "Staff manage profiles" on public.profiles for all using (id = auth.uid() or public.is_staff()) with check (id = auth.uid() or public.is_staff());
create policy "Staff manage families" on public.families for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage clients" on public.clients for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage reports" on public.reports for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage enrollment links" on public.enrollment_links for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage enrollments" on public.enrollments for all using (public.is_staff()) with check (public.is_staff());

create function public.submit_enrollment(
  enrollment_link_id uuid,
  contact_name text,
  contact_email text,
  contact_phone text,
  child_first_name text,
  child_last_name text,
  child_birth_date date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_link public.enrollment_links;
  family_record public.families;
  new_client_id uuid;
  new_enrollment_id uuid;
begin
  select * into current_link from public.enrollment_links where id = enrollment_link_id and active = true;
  if not found then raise exception 'Enrollment link is unavailable'; end if;

  insert into public.families (primary_contact_name, email, phone)
  values (trim(contact_name), lower(trim(contact_email)), trim(contact_phone))
  on conflict (email) do update set primary_contact_name = excluded.primary_contact_name, phone = excluded.phone
  returning * into family_record;

  insert into public.clients (family_id, first_name, last_name, date_of_birth, status, notes)
  values (family_record.id, trim(child_first_name), trim(child_last_name), child_birth_date, 'Waitlist', 'Enrollment: ' || current_link.program)
  returning id into new_client_id;

  insert into public.enrollments (link_id, client_id, parent_name, parent_email, parent_phone, child_name, program, consent_at)
  values (current_link.id, new_client_id, family_record.primary_contact_name, family_record.email, family_record.phone, trim(child_first_name) || ' ' || trim(child_last_name), current_link.program, now())
  returning id into new_enrollment_id;

  return new_enrollment_id;
end;
$$;

revoke all on function public.submit_enrollment(uuid, text, text, text, text, text, date) from public;
grant execute on function public.submit_enrollment(uuid, text, text, text, text, text, date) to anon, authenticated;