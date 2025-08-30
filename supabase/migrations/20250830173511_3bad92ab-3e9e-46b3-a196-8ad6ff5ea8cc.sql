-- Create the admin user in auth.users using simpler approach
-- Insert only the essential fields and let Supabase handle the rest
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
            '{}',
            now(),
            now()
        );
    END IF;
    
    -- Create or update the admin profile
    INSERT INTO public.profiles (id, role, email, username, created_at)
    VALUES (
        admin_user_id,
        'admin'::role_type,
        'admin@pu.edu.pk',
        'ADMIN',
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'admin',
        email = 'admin@pu.edu.pk',
        username = 'ADMIN';
        
END $$;