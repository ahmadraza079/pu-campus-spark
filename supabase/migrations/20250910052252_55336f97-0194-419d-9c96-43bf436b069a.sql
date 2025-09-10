-- Fix security vulnerability: Remove public access to admin profiles
-- Drop the dangerous policy that exposes admin credentials publicly
DROP POLICY IF EXISTS "Allow admin profile lookup for login" ON public.profiles;

-- Create a secure replacement that only allows authenticated users to lookup profiles
-- for legitimate purposes (like course enrollment checks)
CREATE POLICY "Authenticated users can lookup profiles for legitimate purposes" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only authenticated users can access profiles
  auth.uid() IS NOT NULL AND (
    -- Users can see their own profile
    id = auth.uid() OR 
    -- Admins can see all profiles
    is_admin() OR
    -- Teachers can see student profiles for their courses (through enrollments)
    (
      get_current_user_role() = 'teacher' AND
      role = 'student' AND
      EXISTS (
        SELECT 1 FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        WHERE e.student_id = profiles.id 
        AND c.claimed_by = auth.uid()
      )
    )
  )
);

-- For admin login, we'll create a secure function that doesn't expose credentials
CREATE OR REPLACE FUNCTION public.verify_admin_credentials(input_username text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE username = input_username 
    AND role = 'admin'
  );
$$;