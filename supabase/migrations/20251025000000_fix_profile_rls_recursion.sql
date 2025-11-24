/*
  # Fix Infinite Recursion in Profiles RLS Policies

  1. Problem
    - The "Admins can view all profiles" policy creates infinite recursion
    - Policy checks profiles table from within profiles table policy

  2. Solution
    - Drop conflicting policies on profiles, packages, bookings, payments, and site_settings
    - Create a helper function to check admin status using admins table
    - Recreate all policies using the helper function

  3. Security
    - Admin check now uses admins table (no recursion)
    - Maintains same security model without circular references
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

DROP POLICY IF EXISTS "Anyone can view active packages" ON packages;
DROP POLICY IF EXISTS "Admins can view all packages" ON packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON packages;
DROP POLICY IF EXISTS "Admins can update packages" ON packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON packages;
DROP POLICY IF EXISTS "Admins can manage packages" ON packages;

DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage bookings" ON bookings;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
DROP POLICY IF EXISTS "Users can create payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;

DROP POLICY IF EXISTS "Admins can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;

-- Create helper function to check if user is admin using admins table
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate profiles policies without recursion
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Recreate packages policies
CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all packages"
  ON packages FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert packages"
  ON packages FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update packages"
  ON packages FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete packages"
  ON packages FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Recreate bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Recreate payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Recreate site_settings policies
CREATE POLICY "Admins can view site settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
