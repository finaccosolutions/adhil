/*
  # Create Admin Table and Authentication System

  1. New Tables
    - `admins`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `password_hash` (text, not null)
      - `name` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_login` (timestamptz)

  2. Security
    - Enable RLS on admins table
    - Only admins can view admin data
    - No public access to admin table

  3. Initial Admin User
    - Email: adminasif@gmail.com
    - Password: admin900486
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins can view their own data
CREATE POLICY "Admins can view own data"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can update their own data
CREATE POLICY "Admins can update own data"
  ON admins FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Insert default admin user
INSERT INTO admins (email, password_hash, name)
VALUES (
  'adminasif@gmail.com',
  crypt('admin900486', gen_salt('bf')),
  'Admin Asif'
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = crypt('admin900486', gen_salt('bf')),
    updated_at = now();

-- Function to verify admin login
CREATE OR REPLACE FUNCTION verify_admin_login(login_email text, login_password text)
RETURNS TABLE(admin_id uuid, admin_name text, admin_email text) AS $$
BEGIN
  RETURN QUERY
  SELECT id, name, email
  FROM admins
  WHERE email = login_email
    AND password_hash = crypt(login_password, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login time
CREATE OR REPLACE FUNCTION update_admin_last_login(admin_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE admins
  SET last_login = now()
  WHERE id = admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;