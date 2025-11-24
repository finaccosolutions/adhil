/*
  # Add Site Settings and Update Admin User

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `hero_title` (text) - Main hero section title
      - `hero_subtitle` (text) - Hero section subtitle
      - `hero_image_url` (text) - Background image for hero section
      - `trekking_images` (jsonb) - Array of trekking adventure images
      - `gallery_images` (jsonb) - Array of package gallery images
      - `updated_at` (timestamptz)
      - `updated_by` (uuid, references profiles)
    
    - `package_dates`
      - `id` (uuid, primary key)
      - `package_id` (uuid, references packages)
      - `available_date` (date, not null)
      - `max_bookings` (integer, default 50)
      - `current_bookings` (integer, default 0)
      - `is_available` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Admin User
    - Email: adminasif@gmail.com
    - Password: admin900486
    - Updates existing user or creates new one

  3. Security
    - Enable RLS on new tables
    - Public read access for site_settings
    - Admin-only write access for site_settings and package_dates
*/

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text DEFAULT 'Welcome to PackTrack',
  hero_subtitle text DEFAULT 'Your trusted partner for package booking and tracking',
  hero_image_url text DEFAULT '',
  trekking_images jsonb DEFAULT '[]'::jsonb,
  gallery_images jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id)
);

-- Create package_dates table
CREATE TABLE IF NOT EXISTS package_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  available_date date NOT NULL,
  max_bookings integer DEFAULT 50,
  current_bookings integer DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(package_id, available_date)
);

-- Enable Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_dates ENABLE ROW LEVEL SECURITY;

-- Site settings policies
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
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

-- Package dates policies
CREATE POLICY "Anyone can view available package dates"
  ON package_dates FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Public can view available package dates"
  ON package_dates FOR SELECT
  TO anon
  USING (is_available = true);

CREATE POLICY "Admins can view all package dates"
  ON package_dates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert package dates"
  ON package_dates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update package dates"
  ON package_dates FOR UPDATE
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

CREATE POLICY "Admins can delete package dates"
  ON package_dates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_package_dates_package_id ON package_dates(package_id);
CREATE INDEX IF NOT EXISTS idx_package_dates_available_date ON package_dates(available_date);
CREATE INDEX IF NOT EXISTS idx_package_dates_is_available ON package_dates(is_available);

-- Insert default site settings
INSERT INTO site_settings (hero_title, hero_subtitle, trekking_images, gallery_images)
VALUES (
  'Welcome to PackTrack',
  'Your trusted partner for package booking and tracking. Experience seamless service with our comprehensive booking system.',
  '[
    {"title": "Mountain Trekking", "image_url": "", "description": "Experience breathtaking mountain trails"},
    {"title": "Forest Trails", "image_url": "", "description": "Explore lush green forest paths"},
    {"title": "Group Adventures", "image_url": "", "description": "Join fellow adventurers on epic journeys"},
    {"title": "Scenic Photography", "image_url": "", "description": "Capture stunning natural landscapes"}
  ]'::jsonb,
  '[
    {"title": "Backwater Cruise", "image_url": ""},
    {"title": "Tea Gardens", "image_url": ""},
    {"title": "Beach Paradise", "image_url": ""},
    {"title": "Wildlife Safari", "image_url": ""},
    {"title": "Cultural Heritage", "image_url": ""},
    {"title": "Mountain Views", "image_url": ""}
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Create or update admin user
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'adminasif@gmail.com';

  IF admin_user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'adminasif@gmail.com',
      crypt('admin900486', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin Asif","phone":""}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_user_id;

    INSERT INTO profiles (id, email, name, phone, is_admin)
    VALUES (admin_user_id, 'adminasif@gmail.com', 'Admin Asif', '', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  ELSE
    UPDATE auth.users
    SET encrypted_password = crypt('admin900486', gen_salt('bf')),
        updated_at = now()
    WHERE id = admin_user_id;

    UPDATE profiles
    SET is_admin = true
    WHERE id = admin_user_id;
  END IF;
END $$;
