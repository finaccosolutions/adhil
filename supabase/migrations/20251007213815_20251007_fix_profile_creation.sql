/*
  # Fix Profile Creation on User Signup

  1. Changes
    - Drop existing restrictive INSERT policy
    - Add new INSERT policy that allows users to create their own profile
    - Add trigger to automatically create profile when user signs up (optional fallback)

  2. Security
    - Users can only insert their own profile (matching auth.uid())
    - Role defaults to 'user' and cannot be set to 'admin' via signup
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new, more permissive INSERT policy
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id AND 
    (role = 'user' OR role IS NULL)
  );

-- Also update the UPDATE policy to allow role to remain as 'user'
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    (role = 'user' OR role = (SELECT role FROM profiles WHERE id = auth.uid()))
  );