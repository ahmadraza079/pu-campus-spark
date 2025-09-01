-- Drop all existing course policies to start fresh
DROP POLICY IF EXISTS "admin can manage all courses" ON public.courses;
DROP POLICY IF EXISTS "teachers can read assigned courses" ON public.courses;
DROP POLICY IF EXISTS "teachers can update assigned courses" ON public.courses;
DROP POLICY IF EXISTS "students can read enrolled courses" ON public.courses;

-- Create simple, non-recursive policies using the is_admin() function which is already security definer
CREATE POLICY "admins_can_manage_courses" 
ON public.courses 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "teachers_can_read_claimed_courses" 
ON public.courses 
FOR SELECT 
USING (claimed_by = auth.uid());

CREATE POLICY "teachers_can_update_claimed_courses" 
ON public.courses 
FOR UPDATE 
USING (claimed_by = auth.uid())
WITH CHECK (claimed_by = auth.uid());

CREATE POLICY "students_can_read_enrolled_courses" 
ON public.courses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.enrollments 
    WHERE enrollments.course_id = courses.id 
    AND enrollments.student_id = auth.uid()
  )
);

-- Remove unique constraint on code field to allow NULL/empty values
DROP INDEX IF EXISTS courses_code_key;

-- Create unique constraint only for non-null codes
CREATE UNIQUE INDEX courses_code_unique_idx ON public.courses (code) WHERE code IS NOT NULL AND code != '';

-- Also ensure access_code is unique
DROP INDEX IF EXISTS courses_access_code_key;
CREATE UNIQUE INDEX courses_access_code_unique_idx ON public.courses (access_code);