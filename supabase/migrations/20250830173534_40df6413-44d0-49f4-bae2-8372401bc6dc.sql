-- Create the admin user with proper metadata
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@pu.edu.pk';
    
    -- If admin doesn't exist, create it
    IF admin_user_id IS NULL THEN
        admin_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            admin_user_id,
            'authenticated',
            'authenticated',
            'admin@pu.edu.pk',
            crypt('ADMIN789', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"role":"admin","username":"ADMIN"}',
            now(),
            now()
        );
    ELSE
        -- Update existing admin profile
        UPDATE public.profiles 
        SET role = 'admin'::role_type,
            email = 'admin@pu.edu.pk',
            username = 'ADMIN'
        WHERE id = admin_user_id;
    END IF;
        
END $$;