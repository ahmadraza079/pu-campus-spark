-- Fix infinite recursion in profiles RLS policies
-- First, drop the problematic policy that's causing recursion
DROP POLICY IF EXISTS "Authenticated users can lookup profiles for legitimate purposes" ON public.profiles;

-- Create a simpler, non-recursive policy for profile access
CREATE POLICY "Users can read own profile and admins can read all" 
ON public.profiles FOR SELECT 
USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Create a policy for teachers to read student profiles in their courses
CREATE POLICY "Teachers can read student profiles in their courses" 
ON public.profiles FOR SELECT 
USING (
  role = 'student' AND 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'teacher'
  ) AND
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN courses c ON c.id = e.course_id
    WHERE e.student_id = profiles.id 
    AND c.claimed_by = auth.uid()
  )
);