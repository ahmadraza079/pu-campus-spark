-- Fix infinite recursion in courses table RLS policies
-- Drop all existing policies on courses table
DROP POLICY IF EXISTS "admin_all_access" ON public.courses;
DROP POLICY IF EXISTS "students_view_enrolled_courses" ON public.courses;
DROP POLICY IF EXISTS "teachers_manage_claimed_courses" ON public.courses;
DROP POLICY IF EXISTS "teachers_view_all_courses" ON public.courses;

-- Create new simplified policies without recursion
CREATE POLICY "Admin can manage all courses" 
ON public.courses 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Teachers can view all courses" 
ON public.courses 
FOR SELECT 
USING (get_current_user_role() = 'teacher');

CREATE POLICY "Teachers can manage their claimed courses" 
ON public.courses 
FOR ALL 
USING (claimed_by = auth.uid())
WITH CHECK (claimed_by = auth.uid());

CREATE POLICY "Students can view enrolled courses" 
ON public.courses 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM enrollments e 
  WHERE e.course_id = courses.id AND e.student_id = auth.uid()
));

-- Fix enrollments table policies to avoid recursion
DROP POLICY IF EXISTS "enroll read" ON public.enrollments;
DROP POLICY IF EXISTS "enroll insert by course teacher" ON public.enrollments;
DROP POLICY IF EXISTS "enroll delete by course teacher" ON public.enrollments;
DROP POLICY IF EXISTS "admin full enrollments" ON public.enrollments;

CREATE POLICY "Admin can manage all enrollments" 
ON public.enrollments 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Students can view their enrollments" 
ON public.enrollments 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage enrollments for their courses" 
ON public.enrollments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM courses c 
  WHERE c.id = enrollments.course_id AND c.claimed_by = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM courses c 
  WHERE c.id = enrollments.course_id AND c.claimed_by = auth.uid()
));