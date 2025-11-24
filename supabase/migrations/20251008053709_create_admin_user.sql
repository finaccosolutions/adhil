/*
  # Create Admin User

  1. Creates the admin user account
    - Email: admin@tripadikkam.com
    - Password: admin1234
  
  2. Creates admin profile
    - Sets role to 'admin'
    - Username: Admin
    - Phone: +91 9999999999

  Note: This uses Supabase's auth.users table and creates a corresponding profile.
*/

-- Create the admin user using pgcrypto for password hashing
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Insert into auth.users if not exists
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@tripadikkam.com',
    crypt('admin1234', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@tripadikkam.com'
  )
  RETURNING id INTO admin_user_id;

  -- Get the admin user ID if it already exists
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@tripadikkam.com';
  END IF;

  -- Create or update the profile
  INSERT INTO profiles (id, username, phone, role)
  VALUES (admin_user_id, 'Admin', '+91 9999999999', 'admin')
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', username = 'Admin', phone = '+91 9999999999';
END $$;
