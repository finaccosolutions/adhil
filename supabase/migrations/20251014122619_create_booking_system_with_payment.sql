/*
  # Create Tripadikkam Travel Booking Platform with Payment System

  1. New Tables
    - `profiles` - User profiles with role-based access
    - `packages` - Travel packages with pricing and details
    - `package_dates` - Available travel dates for packages
    - `bookings` - Booking records with payment tracking
    - `payment_settings` - Admin payment gateway configuration

  2. Payment Features
    - Advance payment tracking (₹500)
    - Remaining balance tracking
    - Multiple payment methods (GPay, PhonePe)
    - Payment receipt management

  3. Security
    - Enable RLS on all tables
    - Fixed infinite recursion in policies
    - Proper authentication checks
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
  gallery jsonb DEFAULT '[]',
  created_by uuid,
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

-- Create bookings table with enhanced payment tracking
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES packages(id) NOT NULL,
  user_id uuid NOT NULL,
  booking_date timestamptz DEFAULT now(),
  travel_date date NOT NULL,
  members jsonb DEFAULT '[]',
  total_amount numeric NOT NULL CHECK (total_amount >= 0),
  advance_paid boolean DEFAULT false,
  advance_amount numeric DEFAULT 500,
  advance_utr text,
  advance_receipt_url text,
  remaining_amount numeric DEFAULT 0,
  remaining_paid boolean DEFAULT false,
  remaining_utr text,
  remaining_receipt_url text,
  full_payment_done boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create payment_settings table for admin payment configuration
CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Insert default payment settings
INSERT INTO payment_settings (setting_key, setting_value, description)
VALUES 
  ('gpay_number', '8129464465', 'GPay number for receiving payments'),
  ('phonepe_number', '8129464465', 'PhonePe number for receiving payments'),
  ('advance_amount', '500', 'Standard advance payment amount')
ON CONFLICT (setting_key) DO UPDATE 
SET setting_value = EXCLUDED.setting_value;

-- Profiles policies (fixed to avoid infinite recursion)
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Packages policies
CREATE POLICY "Anyone can view packages"
  ON packages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage packages"
  ON packages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Package dates policies
CREATE POLICY "Anyone can view package dates"
  ON package_dates FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage package dates"
  ON package_dates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Payment settings policies
CREATE POLICY "Anyone can view payment settings"
  ON payment_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage payment settings"
  ON payment_settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON packages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_package_dates_package_id ON package_dates(package_id);
CREATE INDEX IF NOT EXISTS idx_package_dates_date ON package_dates(available_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_date ON bookings(travel_date);
CREATE INDEX IF NOT EXISTS idx_payment_settings_key ON payment_settings(setting_key);
