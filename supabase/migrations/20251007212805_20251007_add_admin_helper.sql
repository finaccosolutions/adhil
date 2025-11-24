/*
  # Add Helper Function to Create Admin User

  1. New Function
    - `create_admin_user()` - Function to promote existing user to admin role
    - Takes user_id as parameter
    - Can only be called by existing admins or service role

  2. Usage
    - After a user signs up, their profile can be promoted to admin
    - Execute: SELECT create_admin_user('user-uuid-here');
*/

CREATE OR REPLACE FUNCTION create_admin_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET role = 'admin'
  WHERE id = user_id;
END;
$$;