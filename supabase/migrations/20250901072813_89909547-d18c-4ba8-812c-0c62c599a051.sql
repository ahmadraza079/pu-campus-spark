-- Just fix the RLS policies first
DROP POLICY IF EXISTS "admin can manage all courses" ON public.courses;
DROP POLICY IF EXISTS "teachers can read assigned courses" ON public.courses;
DROP POLICY IF EXISTS "teachers can update assigned courses" ON public.courses;
DROP POLICY IF EXISTS "students can read enrolled courses" ON public.courses;

-- Create simple, non-recursive policies
CREATE POLICY "admins_manage_courses" 
ON public.courses 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "teachers_read_claimed" 
ON public.courses 
FOR SELECT 
USING (claimed_by = auth.uid());

CREATE POLICY "teachers_update_claimed" 
ON public.courses 
FOR UPDATE 
USING (claimed_by = auth.uid())
WITH CHECK (claimed_by = auth.uid());

CREATE POLICY "students_read_enrolled" 
ON public.courses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.course_id = courses.id 
    AND enrollments.student_id = auth.uid()
  )
);