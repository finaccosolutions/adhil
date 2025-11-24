/*
  # Add Gallery Images to Packages

  1. Changes
    - Add `gallery_images` column to packages table to store array of image URLs
    - This allows the package details page to display a gallery section with multiple images
  
  2. Details
    - Column: gallery_images (jsonb array)
    - Default: empty array
    - Used for displaying multiple package images in a gallery section on the details page
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'packages' AND column_name = 'gallery_images'
  ) THEN
    ALTER TABLE packages ADD COLUMN gallery_images jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;