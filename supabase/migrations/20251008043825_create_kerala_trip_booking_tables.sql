/*
  # Kerala Trip Booking System Database Schema

  1. New Tables
    - `packages`
      - `id` (uuid, primary key)
      - `title` (text) - Package name
      - `description` (text) - Package description
      - `price` (numeric) - Price per person
      - `duration` (text) - Duration of the trip
      - `images` (text[]) - Array of image URLs
      - `inclusions` (text[]) - Array of inclusions
      - `itinerary` (jsonb) - Day-wise itinerary
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `package_id` (uuid, foreign key to packages)
      - `name` (text) - Customer name
      - `phone` (text) - Customer phone
      - `members` (jsonb) - Array of members with name and age
      - `booking_date` (date) - Selected booking date
      - `payment_screenshot` (text, nullable) - Payment screenshot URL
      - `status` (text) - 'pending' or 'confirmed'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `available_dates`
      - `id` (uuid, primary key)
      - `package_id` (uuid, foreign key to packages)
      - `date` (date) - Available date
      - `max_bookings` (integer) - Maximum bookings for this date
      - `current_bookings` (integer) - Current number of bookings
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Allow public read access to packages and available_dates
    - Allow public insert access to bookings
    - Restrict update/delete operations to authenticated admin users only
*/

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  duration text NOT NULL,
  images text[] DEFAULT '{}',
  inclusions text[] DEFAULT '{}',
  itinerary jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  members jsonb NOT NULL DEFAULT '[]',
  booking_date date NOT NULL,
  payment_screenshot text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create available_dates table
CREATE TABLE IF NOT EXISTS available_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  date date NOT NULL,
  max_bookings integer DEFAULT 50,
  current_bookings integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(package_id, date)
);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_dates ENABLE ROW LEVEL SECURITY;

-- Packages policies (public read, admin write)
CREATE POLICY "Anyone can view packages"
  ON packages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can insert packages"
  ON packages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update packages"
  ON packages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete packages"
  ON packages FOR DELETE
  TO authenticated
  USING (true);

-- Bookings policies (public read and insert, admin update)
CREATE POLICY "Anyone can view bookings"
  ON bookings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (true);

-- Available dates policies (public read, admin write)
CREATE POLICY "Anyone can view available dates"
  ON available_dates FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can insert available dates"
  ON available_dates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update available dates"
  ON available_dates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete available dates"
  ON available_dates FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS bookings_package_id_idx ON bookings(package_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);
CREATE INDEX IF NOT EXISTS bookings_booking_date_idx ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS available_dates_package_id_idx ON available_dates(package_id);
CREATE INDEX IF NOT EXISTS available_dates_date_idx ON available_dates(date);