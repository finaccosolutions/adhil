/*
  # Trekking & Camping Package Booking Application Schema

  ## Overview
  Complete database schema for a trekking/camping package booking platform with user and admin features.

  ## New Tables

  ### 1. `profiles`
  User profile information linked to auth.users
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, unique, not null)
  - `full_name` (text)
  - `phone` (text)
  - `is_admin` (boolean, default false)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### 2. `packages`
  Trekking/camping package details
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `description` (text)
  - `destination` (text)
  - `price_per_head` (decimal, not null)
  - `advance_payment` (decimal, not null)
  - `duration_days` (integer, not null)
  - `start_date` (date)
  - `end_date` (date)
  - `max_capacity` (integer, not null)
  - `image_url` (text)
  - `gallery_images` (jsonb, array of image URLs)
  - `inclusions` (jsonb, array of {icon, text})
  - `itinerary` (jsonb, array of day schedules)
  - `facilities` (jsonb, array of {icon, text})
  - `contact_info` (jsonb, {note, phone})
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### 3. `package_available_dates`
  Available booking dates for packages
  - `id` (uuid, primary key)
  - `package_id` (uuid, references packages)
  - `available_date` (date, not null)
  - `current_bookings` (integer, default 0)
  - `is_available` (boolean, default true)
  - `created_at` (timestamptz, default now())

  ### 4. `bookings`
  User bookings for packages
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `package_id` (uuid, references packages)
  - `booking_date` (date, not null)
  - `travel_group_name` (text, not null)
  - `number_of_members` (integer, not null)
  - `total_price` (decimal, not null)
  - `advance_paid` (decimal, not null)
  - `status` (text, default 'pending') - pending, confirmed, cancelled
  - `payment_status` (text, default 'advance_paid') - advance_paid, fully_paid
  - `whatsapp_conversation_link` (text)
  - `admin_notes` (text)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### 5. `booking_members`
  Individual member details for each booking
  - `id` (uuid, primary key)
  - `booking_id` (uuid, references bookings)
  - `member_name` (text, not null)
  - `member_phone` (text, not null)
  - `created_at` (timestamptz, default now())

  ## Security
  - Enable RLS on all tables
  - Profiles: Users can read/update own profile, admins can read all
  - Packages: Everyone can read, only admins can create/update/delete
  - Package Available Dates: Everyone can read, only admins can manage
  - Bookings: Users can create/read own bookings, admins can read/update all
  - Booking Members: Users can create own members, users and admins can read related members

  ## Indexes
  - Package available dates by package_id and date
  - Bookings by user_id and package_id
  - Booking members by booking_id
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  destination text,
  price_per_head decimal(10,2) NOT NULL,
  advance_payment decimal(10,2) NOT NULL,
  duration_days integer NOT NULL,
  start_date date,
  end_date date,
  max_capacity integer NOT NULL,
  image_url text,
  gallery_images jsonb DEFAULT '[]'::jsonb,
  inclusions jsonb DEFAULT '[]'::jsonb,
  itinerary jsonb DEFAULT '[]'::jsonb,
  facilities jsonb DEFAULT '[]'::jsonb,
  contact_info jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create package_available_dates table
CREATE TABLE IF NOT EXISTS package_available_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES packages(id) ON DELETE CASCADE NOT NULL,
  available_date date NOT NULL,
  current_bookings integer DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(package_id, available_date)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  package_id uuid REFERENCES packages(id) ON DELETE CASCADE NOT NULL,
  booking_date date NOT NULL,
  travel_group_name text NOT NULL,
  number_of_members integer NOT NULL,
  total_price decimal(10,2) NOT NULL,
  advance_paid decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'advance_paid',
  whatsapp_conversation_link text,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create booking_members table
CREATE TABLE IF NOT EXISTS booking_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  member_name text NOT NULL,
  member_phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_package_dates_package_id ON package_available_dates(package_id);
CREATE INDEX IF NOT EXISTS idx_package_dates_date ON package_available_dates(available_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_booking_members_booking_id ON booking_members(booking_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_available_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Packages policies
CREATE POLICY "Anyone can view active packages"
  ON packages FOR SELECT
  TO authenticated
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
  TO authenticated
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

-- Bookings policies
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

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Users can create booking members for own bookings"
  ON booking_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_members.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();