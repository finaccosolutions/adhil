/*
  # Fix Profiles RLS Infinite Recursion - V2

  1. Changes
    - Drop ALL existing policies on profiles
    - Create simple non-recursive policies
    - Users can view and update their own profile
    - Make profiles table publicly readable for now (no admin check needed)
    
  2. Security
    - Users can view their own profiles
    - Users can update their own profiles
    - Public read access for basic profile data
*/

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);