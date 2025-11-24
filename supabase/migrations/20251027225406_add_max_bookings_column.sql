/*
  # Add max_bookings column to package_available_dates

  1. Changes
    - Add max_bookings column to package_available_dates table
    - Set default value based on packages.max_capacity
    
  2. Notes
    - This allows each date to have its own capacity limit
*/

ALTER TABLE package_available_dates 
ADD COLUMN IF NOT EXISTS max_bookings INTEGER NOT NULL DEFAULT 20;