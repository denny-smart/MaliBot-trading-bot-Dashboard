-- Create a function that deletes the user from auth.users
-- This needs to be SECURITY DEFINER to bypass RLS and access the auth schema
create or replace function public.delete_user_from_auth()
returns trigger as $$
begin
  delete from auth.users where id = old.id;
  return old;
end;
$$ language plpgsql security definer;

-- Create the trigger on the profiles table
-- applying it AFTER DELETE so the profile is gone, and then we clean up the auth user
create or replace trigger on_profile_delete
  after delete on public.profiles
  for each row execute procedure public.delete_user_from_auth();

-- 0. Helper Function to check Admin status (Security Definer to avoid RLS recursion)
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- Fix security warning for existing handle_new_user function if it exists
do $$
begin
  if exists (select 1 from pg_proc where proname = 'handle_new_user') then
    alter function public.handle_new_user() set search_path = public;
  end if;
end $$;

-- Enable RLS
alter table public.profiles enable row level security;

-- 1. DELETE Policy (Admins only)
drop policy if exists "Admins can delete profiles" on public.profiles;
create policy "Admins can delete profiles"
  on public.profiles
  for delete
  using ( public.is_admin() );

-- 2. SELECT Policy (Admins see all, Users see own)
drop policy if exists "Profiles visible to owner and admins" on public.profiles;
create policy "Profiles visible to owner and admins"
  on public.profiles
  for select
  using (
    auth.uid() = id
    or
    public.is_admin()
  );

-- 3. UPDATE Policy (Admins update all, Users update own)
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles
  for update
  using ( public.is_admin() );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using ( auth.uid() = id );

