/*
  # Initial Schema for Va Oru Trippadikkam

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, not null)
      - `phone` (text, not null)
      - `role` (text, default 'user', constrained to 'user' or 'admin')
      - `created_at` (timestamptz, default now())
    
    - `packages`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `price` (numeric, not null)
      - `images` (text array)
      - `duration` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz, default now())
    
    - `package_dates`
      - `id` (uuid, primary key)
      - `package_id` (uuid, references packages, cascade delete)
      - `available_date` (date, not null)
      - `seats` (integer, default 0)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `package_id` (uuid, references packages)
      - `user_id` (uuid, references profiles)
      - `booking_date` (timestamptz, default now())
      - `travel_date` (date)
      - `members` (jsonb)
      - `total_amount` (numeric)
      - `advance_paid` (boolean, default false)
      - `advance_amount` (numeric, default 0)
      - `advance_utr` (text)
      - `advance_receipt_url` (text)
      - `status` (text, default 'pending', constrained)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Profiles: users can insert their own, update their own
    - Packages: public read, admin-only write
    - Package_dates: public read, admin-only write
    - Bookings: users can create and view their own, admins can view all and update

  3. Important Notes
    - Admin account must be manually inserted after auth user creation
    - All tables use UUIDs for primary keys
    - Cascade deletes configured for package_dates when package is deleted
    - Status fields use CHECK constraints for data integrity
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  phone text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'user');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user');

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  images text[],
  duration text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view packages"
  ON packages FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can insert packages"
  ON packages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update packages"
  ON packages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete packages"
  ON packages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create package_dates table
CREATE TABLE IF NOT EXISTS package_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES packages(id) ON DELETE CASCADE,
  available_date date NOT NULL,
  seats integer DEFAULT 0
);

ALTER TABLE package_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view package dates"
  ON package_dates FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can insert package dates"
  ON package_dates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update package dates"
  ON package_dates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete package dates"
  ON package_dates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES packages(id),
  user_id uuid REFERENCES profiles(id),
  booking_date timestamptz DEFAULT now(),
  travel_date date,
  members jsonb,
  total_amount numeric,
  advance_paid boolean DEFAULT false,
  advance_amount numeric DEFAULT 0,
  advance_utr text,
  advance_receipt_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

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
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

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
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );