/*
  # Enhance User Profiles with Additional Fields

  1. Changes to Tables
    - `profiles`
      - Add `full_name` (text) - User's complete name
      - Add `date_of_birth` (date) - User's birth date
      - Add `address` (text, optional) - User's address
      - Add `profile_picture_url` (text, optional) - Profile image URL
      - Add `preferences` (jsonb, optional) - User preferences stored as JSON
      - Add `email_verified` (boolean) - Email verification status
      - Add `account_status` (text) - Account status: active/suspended/deleted
      - Add `last_login` (timestamptz) - Last login timestamp
      - Add `updated_at` (timestamptz) - Profile update timestamp

  2. Security
    - Maintain existing RLS policies
    - Add index on email_verified for faster lookups
    - Add index on account_status for admin queries
    - Add trigger to automatically update updated_at timestamp

  3. Important Notes
    - All new fields are nullable to maintain backward compatibility
    - Preferences stored as JSONB for flexibility
    - Account status defaults to 'active'
    - Email verified defaults to false (Supabase handles verification separately)
*/

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_picture_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add constraint for account_status if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_account_status_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_account_status_check 
      CHECK (account_status IN ('active', 'suspended', 'deleted'));
  END IF;
END $$;

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at DESC);