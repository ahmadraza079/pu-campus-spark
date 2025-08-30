-- First, create the admin user in auth.users if it doesn't exist
-- This inserts the admin with a secure password
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  confirmed_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@pu.edu.pk',
  crypt('ADMIN789', gen_salt('bf')),
  now(),
  now(),
  '',
  now(),
  '',
  null,
  '',
  '',
  null,
  null,
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  now(),
  now(),
  null,
  null,
  '',
  '',
  null,
  now(),
  '',
  0,
  null,
  '',
  null
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@pu.edu.pk'
);

-- Create or update the admin profile
INSERT INTO public.profiles (id, role, email, username, created_at)
SELECT 
  u.id,
  'admin'::role_type,
  'admin@pu.edu.pk',
  'ADMIN',
  now()
FROM auth.users u 
WHERE u.email = 'admin@pu.edu.pk'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  email = 'admin@pu.edu.pk',
  username = 'ADMIN';