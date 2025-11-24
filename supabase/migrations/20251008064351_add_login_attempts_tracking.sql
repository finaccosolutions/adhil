/*
  # Add Login Attempts Tracking for Security

  1. New Tables
    - `login_attempts`
      - `id` (uuid, primary key) - Unique attempt identifier
      - `email` (text) - Email used for login attempt
      - `ip_address` (text) - IP address of attempt
      - `success` (boolean) - Whether login was successful
      - `attempt_time` (timestamptz) - When attempt occurred
      - `user_agent` (text, optional) - Browser/device info

  2. Security
    - Enable RLS on login_attempts table
    - Only admins can view login attempts
    - Automatic cleanup of old attempts (30 days)
    - Index on email and attempt_time for rate limiting queries

  3. Important Notes
    - Used for security monitoring and rate limiting
    - Helps prevent brute force attacks
    - Admins can view failed login patterns
*/

-- Create login_attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  success boolean DEFAULT false,
  attempt_time timestamptz DEFAULT now(),
  user_agent text
);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Login attempts policies
CREATE POLICY "Admins can view all login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "System can insert login attempts"
  ON login_attempts FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempt_time DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON login_attempts(email, attempt_time DESC);

-- Function to clean up old login attempts (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts
  WHERE attempt_time < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;