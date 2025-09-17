-- Drop all existing problematic policies on profiles table
DROP POLICY IF EXISTS "read own profile" ON public.profiles;
DROP POLICY IF EXISTS "update own profile" ON public.profiles;
DROP POLICY IF EXISTS "admin full profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile and admins can read all" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can read student profiles in their courses" ON public.profiles;

-- Create simple, non-recursive policies
-- 1. Users can read and update their own profile
CREATE POLICY "Users can access own profile"
ON public.profiles
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Admins can access all profiles using the secure function
CREATE POLICY "Admins can access all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());