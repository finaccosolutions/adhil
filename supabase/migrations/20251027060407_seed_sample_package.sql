/*
  # Seed Sample Package Data

  ## Purpose
  Adds initial sample trekking package (Kolukumalai) to the database for testing and demonstration.

  ## Changes
  - Inserts one sample package with complete details
  - Adds several available dates for booking
*/

-- Insert sample package
INSERT INTO packages (
  title,
  description,
  destination,
  price_per_head,
  advance_payment,
  duration_days,
  max_capacity,
  image_url,
  gallery_images,
  inclusions,
  itinerary,
  facilities,
  contact_info,
  is_active
)
VALUES (
  'Kolukumalai Trekking & Camping Package',
  'Experience the breathtaking sunrise at Kolukumalai, the world''s highest tea estate, combined with stunning sunset views at Anayirangal Dam. Enjoy camping, trekking, campfire, music, unlimited food, and an unforgettable offroad jeep safari adventure.',
  'Kolukumalai, Munnar',
  1799.00,
  500.00,
  2,
  50,
  'https://images.pexels.com/photos/2437291/pexels-photo-2437291.jpeg',
  '["https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg", "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg", "https://images.pexels.com/photos/1670732/pexels-photo-1670732.jpeg", "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg", "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg", "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg"]'::jsonb,
  '[{"icon": "🌅", "text": "Anayirangal dam view sunset trekking"}, {"icon": "🌄", "text": "Kolukumalai Sunrise Trekking"}, {"icon": "🔥", "text": "Campfire"}, {"icon": "🎶", "text": "Music"}, {"icon": "☕", "text": "Tea"}, {"icon": "🍽️", "text": "Dinner"}, {"icon": "🍞", "text": "Breakfast"}, {"icon": "🍗", "text": "Chicken 65"}, {"icon": "🚗", "text": "Offroad Jeep Safari"}]'::jsonb,
  '[{"day": 1, "title": "Day 1 - Arrival & Sunset Trekking", "activities": [{"time": "02:00 PM", "activity": "Check In"}, {"time": "04:00 PM", "activity": "Welcome Tea"}, {"time": "05:00 PM", "activity": "Evening Sunset Trekking to Anayirangal dam view"}, {"time": "07:00 PM", "activity": "Reach Back To Campsite"}, {"time": "07:20 PM", "activity": "Campfire with Music"}, {"time": "09:00 PM", "activity": "Dinner - Unlimited Food (Chapatti, Chicken Gravy, Ghee Rice, Dal, Onion Raita, Chicken 65)"}]}, {"day": 2, "title": "Day 2 - Sunrise Trek & Departure", "activities": [{"time": "04:00 AM", "activity": "Wake-up Call"}, {"time": "04:30 AM", "activity": "Jeep Trek To Kolukumalai"}, {"time": "06:30 AM", "activity": "Visit Sunrise, View Point and Jaguar Rock"}, {"time": "07:30 AM", "activity": "Back To Jeep Pickup Point"}, {"time": "08:30 AM", "activity": "Reach Back To Campsite"}, {"time": "09:30 AM", "activity": "Breakfast - Unlimited Food (Idli, Vada, Tea)"}, {"time": "10:00 AM", "activity": "Travel Experience Section"}, {"time": "11:30 AM", "activity": "Check out"}]}]'::jsonb,
  '[{"icon": "🌿", "text": "Free WiFi"}, {"icon": "🌿", "text": "Trekking Guide"}, {"icon": "🌿", "text": "24 Hours Service Man"}, {"icon": "🌿", "text": "Bike and Car parking Area"}, {"icon": "🌿", "text": "Mobile Charging Point"}, {"icon": "🌿", "text": "Girls and Boys separate Washrooms"}]'::jsonb,
  '{"note": "For Booking & More Details Call/WhatsApp", "phone": "8129464465"}'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- Add some available dates for the package (only if package was inserted)
DO $$
DECLARE
  pkg_id uuid;
BEGIN
  SELECT id INTO pkg_id FROM packages WHERE title = 'Kolukumalai Trekking & Camping Package' LIMIT 1;
  
  IF pkg_id IS NOT NULL THEN
    INSERT INTO package_available_dates (package_id, available_date, is_available)
    VALUES
      (pkg_id, CURRENT_DATE + INTERVAL '7 days', true),
      (pkg_id, CURRENT_DATE + INTERVAL '14 days', true),
      (pkg_id, CURRENT_DATE + INTERVAL '21 days', true),
      (pkg_id, CURRENT_DATE + INTERVAL '28 days', true),
      (pkg_id, CURRENT_DATE + INTERVAL '35 days', true)
    ON CONFLICT (package_id, available_date) DO NOTHING;
  END IF;
END $$;