/*
  # Add Guest Booking Support

  1. Schema Changes
    - Make `user_id` in bookings table nullable
    - Add guest contact fields: `guest_name`, `guest_email`, `guest_phone`
    - Add `booking_reference` for easy guest lookup
    - Add `booking_type` to distinguish authenticated vs guest bookings

  2. Security
    - Update RLS policies to allow anonymous users to:
      - View active packages
      - View available dates
      - Create guest bookings
    - Maintain admin-only restrictions for sensitive operations

  3. New Policies
    - Anonymous users can select packages and dates
    - Unauthenticated users can create guest bookings
    - Guest bookings require contact information
*/

-- Make user_id nullable in bookings table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE bookings ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- Add guest booking fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'guest_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN guest_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'guest_email'
  ) THEN
    ALTER TABLE bookings ADD COLUMN guest_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'guest_phone'
  ) THEN
    ALTER TABLE bookings ADD COLUMN guest_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_reference text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'booking_type'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_type text DEFAULT 'guest' CHECK (booking_type IN ('authenticated', 'guest'));
  END IF;
END $$;

-- Drop all existing RLS policies to recreate them
DROP POLICY IF EXISTS "Anyone can view active packages" ON packages;
DROP POLICY IF EXISTS "Admins can view all packages" ON packages;
DROP POLICY IF EXISTS "Admins can insert packages" ON packages;
DROP POLICY IF EXISTS "Admins can update packages" ON packages;
DROP POLICY IF EXISTS "Admins can delete packages" ON packages;
DROP POLICY IF EXISTS "Anyone can view available dates" ON package_available_dates;
DROP POLICY IF EXISTS "Admins can insert available dates" ON package_available_dates;
DROP POLICY IF EXISTS "Admins can update available dates" ON package_available_dates;
DROP POLICY IF EXISTS "Admins can delete available dates" ON package_available_dates;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Anonymous users can create guest bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own booking members" ON booking_members;
DROP POLICY IF EXISTS "Admins can view all booking members" ON booking_members;
DROP POLICY IF EXISTS "Users can create booking members for own bookings" ON booking_members;
DROP POLICY IF EXISTS "Authenticated users can create booking members" ON booking_members;
DROP POLICY IF EXISTS "Anyone can create booking members for guest bookings" ON booking_members;

-- Packages policies - allow anonymous and authenticated users to view active packages
CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all packages"
  ON packages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert packages"
  ON packages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update packages"
  ON packages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete packages"
  ON packages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Package available dates policies
CREATE POLICY "Anyone can view available dates"
  ON package_available_dates FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert available dates"
  ON package_available_dates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update available dates"
  ON package_available_dates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete available dates"
  ON package_available_dates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Bookings policies - allow both authenticated and guest bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND booking_type = 'authenticated');

CREATE POLICY "Anonymous users can create guest bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    user_id IS NULL 
    AND booking_type = 'guest'
    AND guest_name IS NOT NULL
    AND guest_email IS NOT NULL
    AND guest_phone IS NOT NULL
  );

CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Booking members policies
CREATE POLICY "Users can view own booking members"
  ON booking_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_members.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all booking members"
  ON booking_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authenticated users can create booking members"
  ON booking_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_members.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create booking members for guest bookings"
  ON booking_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_members.booking_id
      AND bookings.user_id IS NULL
      AND bookings.booking_type = 'guest'
    )
  );

-- Create indexes for booking reference lookup
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_phone ON bookings(guest_phone);
