-- Verify admin email address
UPDATE auth.users 
SET email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'ahmadraza.pk79@gmail.com' AND role = 'authenticated';