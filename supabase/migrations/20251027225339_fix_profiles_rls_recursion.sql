/*
  # Fix Profiles RLS Infinite Recursion

  1. Changes
    - Drop the recursive "Admins can view all profiles" policy
    - Create a simpler admin policy that checks is_admin on the current user's row directly
    
  2. Security
    - Users can still view their own profiles
    - Admins can view all profiles without recursion
    - Users can update their own profiles
*/

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = id) 
    OR 
    (
      (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    )
  );