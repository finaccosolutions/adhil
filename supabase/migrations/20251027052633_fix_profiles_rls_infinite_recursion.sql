/*
  # Fix Profiles RLS Infinite Recursion

  1. Changes
    - Drop all existing policies on profiles table
    - Create new, non-recursive policies for user access
    - Store admin flag in auth.users metadata instead of querying profiles table
    - Add simpler admin policies using auth metadata

  2. Security
    - Users can only read/update their own profile
    - Admin access controlled via auth.users metadata
    - No recursive policy checks
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create simple, non-recursive policies

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policies using auth metadata (non-recursive)
-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
  )
  WITH CHECK (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false) = true
  );
