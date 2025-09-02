-- First, let's see what the is_admin function is doing
SELECT proname, prosrc FROM pg_proc WHERE proname = 'is_admin';

-- Check for any recursive issues in the policies
-- Let's also ensure the current user role function is properly defined
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Drop existing policies if they exist and recreate them properly
DROP POLICY IF EXISTS "admin_all_access" ON public.courses;
DROP POLICY IF EXISTS "students_view_enrolled_courses" ON public.courses;
DROP POLICY IF EXISTS "teachers_manage_claimed_courses" ON public.courses;

-- Create simple, non-recursive policies
CREATE POLICY "admin_all_access" ON public.courses
FOR ALL 
USING (get_current_user_role() = 'admin') 
WITH CHECK (get_current_user_role() = 'admin');

-- Students can see courses they are enrolled in
CREATE POLICY "students_view_enrolled_courses" ON public.courses
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.course_id = courses.id AND e.student_id = auth.uid()
  )
);

-- Teachers can manage courses they have claimed
CREATE POLICY "teachers_manage_claimed_courses" ON public.courses
FOR ALL 
USING (claimed_by = auth.uid()) 
WITH CHECK (claimed_by = auth.uid());

-- Also add a policy for teachers to view all courses (so they can claim them)
CREATE POLICY "teachers_view_all_courses" ON public.courses
FOR SELECT
USING (get_current_user_role() = 'teacher');