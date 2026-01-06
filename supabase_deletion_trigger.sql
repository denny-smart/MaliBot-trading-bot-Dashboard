create or replace function public.delete_user_from_auth()
returns trigger 
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = old.id;
  return old;
end;
$$;

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

-- 40. Enable RLS
alter table public.profiles enable row level security;

-- CLEANUP: Drop all previous versions of policies to fix "Multiple Permissive Policies" warnings
drop policy if exists "Admins can delete profiles" on public.profiles;
drop policy if exists "Profiles visible to owner and admins" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles; -- Removing the lingering old policy
drop policy if exists "Admins can update any profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- 50. DELETE Policy (Admins only)
-- Using (select ...) to force initplan for performance
create policy "Admins can delete profiles"
  on public.profiles
  for delete
  using ( (select public.is_admin()) );

-- 60. SELECT Policy (Combined: Admin OR Owner)
create policy "Profiles visible to owner and admins"
  on public.profiles
  for select
  using (
    (select auth.uid()) = id
    or
    (select public.is_admin())
  );

-- 70. UPDATE Policy (Combined: Admin OR Owner)
create policy "Admins or owners can update profile"
  on public.profiles
  for update
  using (
    (select auth.uid()) = id
    or
    (select public.is_admin())
  );

