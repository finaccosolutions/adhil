/*
  # Trip Package Booking System

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `phone` (text)
      - `role` (text) - 'admin' or 'user'
      - `created_at` (timestamptz)
    
    - `packages`
      - `id` (uuid, primary key)
      - `title` (text) - Package name
      - `description` (text) - Package details
      - `destination` (text)
      - `duration_days` (integer)
      - `price_per_head` (integer) - Full package price
      - `advance_payment` (integer) - Fixed at 500
      - `max_capacity` (integer)
      - `start_date` (date)
      - `end_date` (date)
      - `image_url` (text)
      - `is_active` (boolean)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `package_id` (uuid, references packages)
      - `user_id` (uuid, references profiles)
      - `number_of_people` (integer)
      - `total_amount` (integer) - Full amount
      - `advance_paid` (integer) - 500 * number_of_people
      - `remaining_amount` (integer)
      - `payment_proof_url` (text) - Image/document URL
      - `payment_proof_type` (text) - File type
      - `status` (text) - 'pending', 'confirmed', 'cancelled'
      - `user_phone` (text)
      - `user_name` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Profiles: Users can read all profiles, update own profile
    - Packages: Everyone can read active packages, only admins can create/update
    - Bookings: Users can read own bookings and create new ones, admins can read all

  3. Important Notes
    - Advance payment is fixed at 500 per person
    - Payment proof is uploaded by user during booking
    - Admin can view all bookings with payment proofs
    - WhatsApp sharing will be handled in the frontend
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  destination text NOT NULL,
  duration_days integer NOT NULL DEFAULT 1,
  price_per_head integer NOT NULL,
  advance_payment integer NOT NULL DEFAULT 500,
  max_capacity integer NOT NULL DEFAULT 10,
  start_date date NOT NULL,
  end_date date NOT NULL,
  image_url text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT
  TO authenticated
  USING (is_active = true OR created_by = auth.uid());

CREATE POLICY "Admins can create packages"
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

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  number_of_people integer NOT NULL DEFAULT 1 CHECK (number_of_people > 0),
  total_amount integer NOT NULL,
  advance_paid integer NOT NULL,
  remaining_amount integer NOT NULL,
  payment_proof_url text,
  payment_proof_type text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  user_phone text NOT NULL,
  user_name text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

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
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update bookings"
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

-- Create updated_at trigger for bookings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active, start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package ON bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);