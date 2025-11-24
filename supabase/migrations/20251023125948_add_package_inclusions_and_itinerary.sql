/*
  # Add Package Inclusions and Itinerary Fields

  1. Changes
    - Add `inclusions` column to packages table (jsonb array)
    - Add `itinerary` column to packages table (jsonb array)
    - Add `facilities` column to packages table (jsonb array)
    - Add `contact_info` column to packages table (jsonb object)
    
  2. Purpose
    - Store detailed package inclusions (food, activities, etc.)
    - Store day-by-day itinerary with times and activities
    - Store camp/accommodation facilities
    - Store contact information for bookings
*/

DO $$
BEGIN
  -- Add inclusions column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packages' AND column_name = 'inclusions'
  ) THEN
    ALTER TABLE packages ADD COLUMN inclusions jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add itinerary column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packages' AND column_name = 'itinerary'
  ) THEN
    ALTER TABLE packages ADD COLUMN itinerary jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add facilities column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packages' AND column_name = 'facilities'
  ) THEN
    ALTER TABLE packages ADD COLUMN facilities jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add contact_info column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packages' AND column_name = 'contact_info'
  ) THEN
    ALTER TABLE packages ADD COLUMN contact_info jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;