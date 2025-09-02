-- Drop all existing policies for courses table to fix infinite recursion
DROP POLICY IF EXISTS "admins_manage_courses" ON public.courses;
DROP POLICY IF EXISTS "students_read_enrolled" ON public.courses;
DROP POLICY IF EXISTS "teachers_read_claimed" ON public.courses;
DROP POLICY IF EXISTS "teachers_update_claimed" ON public.courses;

-- Create simple, non-recursive policies for courses
CREATE POLICY "admin_all_access" ON public.courses
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Students can see courses they are enrolled in
CREATE POLICY "students_view_enrolled_courses" ON public.courses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.course_id = courses.id AND e.student_id = auth.uid()
  )
);

-- Teachers can view and update courses they have claimed
CREATE POLICY "teachers_manage_claimed_courses" ON public.courses
FOR ALL USING (claimed_by = auth.uid()) 
WITH CHECK (claimed_by = auth.uid());