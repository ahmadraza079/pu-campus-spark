-- Fix the infinite recursion by removing problematic policies and creating simpler ones
DROP POLICY IF EXISTS "Teachers can view all courses" ON public.courses;

-- Create a simple policy for teachers that doesn't reference the courses table recursively
CREATE POLICY "Teachers can view all courses" 
ON public.courses 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() AND p.role = 'teacher'
));