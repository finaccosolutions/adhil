/*
  # Create Tripadikkam Travel Booking Platform Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Links to auth.users
      - `username` (text) - User's display name
      - `phone` (text) - Contact number
      - `role` (text) - User role: 'user' or 'admin'
      - `created_at` (timestamp) - Account creation time
    
    - `packages`
      - `id` (uuid, primary key) - Unique package identifier
      - `title` (text) - Package name
      - `description` (text) - Package details
      - `price` (numeric) - Package price
      - `duration` (text) - Trip duration
      - `images` (text[]) - Array of image URLs
      - `created_by` (uuid) - Admin who created package
      - `created_at` (timestamp) - Creation time
    
    - `package_dates`
      - `id` (uuid, primary key) - Unique date slot identifier
      - `package_id` (uuid) - Links to packages
      - `available_date` (date) - Travel date
      - `seats` (integer) - Available seats
    
    - `bookings`
      - `id` (uuid, primary key) - Unique booking identifier
      - `package_id` (uuid) - Links to packages
      - `user_id` (uuid) - Links to profiles
      - `booking_date` (timestamp) - When booking was made
      - `travel_date` (date) - Selected travel date
      - `members` (jsonb) - Array of member details
      - `total_amount` (numeric) - Total booking cost
      - `advance_paid` (boolean) - Advance payment status
      - `advance_amount` (numeric) - Advance payment amount
      - `advance_utr` (text) - Payment reference ID
      - `advance_receipt_url` (text) - Payment screenshot URL
      - `full_payment_done` (boolean) - Full payment status
      - `status` (text) - Booking status: pending/confirmed/cancelled
      - `created_at` (timestamp) - Booking creation time

  2. Security
    - Enable RLS on all tables
    - Profiles: Users can read all, update own, admins can manage all
    - Packages: Public read, admins can manage
    - Package Dates: Public read, admins can manage
    - Bookings: Users can read/create own, admins can manage all
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

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  duration text NOT NULL,
  images text[] DEFAULT '{}',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Create package_dates table
CREATE TABLE IF NOT EXISTS package_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES packages(id) ON DELETE CASCADE NOT NULL,
  available_date date NOT NULL,
  seats integer NOT NULL CHECK (seats >= 0)
);

ALTER TABLE package_dates ENABLE ROW LEVEL SECURITY;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES packages(id) NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  booking_date timestamptz DEFAULT now(),
  travel_date date NOT NULL,
  members jsonb DEFAULT '[]',
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  advance_paid boolean DEFAULT false,
  advance_amount numeric DEFAULT 0,
  advance_utr text,
  advance_receipt_url text,
  full_payment_done boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
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

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Packages policies
CREATE POLICY "Anyone can view packages"
  ON packages FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert packages"
  ON packages FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update packages"
  ON packages FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete packages"
  ON packages FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Package dates policies
CREATE POLICY "Anyone can view package dates"
  ON package_dates FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert package dates"
  ON package_dates FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can update package dates"
  ON package_dates FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete package dates"
  ON package_dates FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can insert own bookings"
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
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON packages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_package_dates_package_id ON package_dates(package_id);
CREATE INDEX IF NOT EXISTS idx_package_dates_date ON package_dates(available_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_date ON bookings(travel_date);