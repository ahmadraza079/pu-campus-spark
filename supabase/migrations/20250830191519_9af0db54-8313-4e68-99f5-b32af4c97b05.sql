-- Update admin email address
UPDATE auth.users 
SET email = 'ahmadraza.pk79@gmail.com',
    updated_at = now()
WHERE email = 'admin@pu.edu.pk';

-- Update admin profile email
UPDATE public.profiles 
SET email = 'ahmadraza.pk79@gmail.com'
WHERE email = 'admin@pu.edu.pk';