/*
  # Fix Public Access to Packages
  
  1. Changes
    - Drop the existing restrictive policy for viewing active packages
    - Create a new policy that allows both authenticated and anonymous users to view active packages
  
  2. Security
    - Users can view only active packages (is_active = true)
    - No authentication required for viewing packages
    - Admins retain full control over package management
*/

DROP POLICY IF EXISTS "Anyone can view active packages" ON packages;

CREATE POLICY "Public can view active packages"
  ON packages
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
