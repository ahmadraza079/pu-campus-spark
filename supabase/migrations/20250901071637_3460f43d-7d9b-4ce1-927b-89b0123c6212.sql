-- Fix RLS infinite recursion by simplifying course policies
DROP POLICY IF EXISTS "admin full courses" ON public.courses;
DROP POLICY IF EXISTS "course insert by teacher" ON public.courses;
DROP POLICY IF EXISTS "course read" ON public.courses;
DROP POLICY IF EXISTS "course update by owner" ON public.courses;

-- Create simpler course policies
CREATE POLICY "admin can manage all courses" 
ON public.courses 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "teachers can read assigned courses" 
ON public.courses 
FOR SELECT 
USING (teacher_id = auth.uid());

CREATE POLICY "teachers can update assigned courses" 
ON public.courses 
FOR UPDATE 
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "students can read enrolled courses" 
ON public.courses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.course_id = courses.id AND e.student_id = auth.uid()
  )
);

-- Add claimed_by column to courses to track teacher assignments
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id);

-- Create course_materials table for file uploads
CREATE TABLE IF NOT EXISTS public.course_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on course_materials
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for course_materials
CREATE POLICY "admin can manage all course materials" 
ON public.course_materials 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "teachers can manage materials for their courses" 
ON public.course_materials 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM courses c 
    WHERE c.id = course_materials.course_id 
    AND (c.teacher_id = auth.uid() OR c.claimed_by = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses c 
    WHERE c.id = course_materials.course_id 
    AND (c.teacher_id = auth.uid() OR c.claimed_by = auth.uid())
  )
);

CREATE POLICY "students can read materials for enrolled courses" 
ON public.course_materials 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM enrollments e 
    WHERE e.course_id = course_materials.course_id 
    AND e.student_id = auth.uid()
  )
);

-- Create course_claims table to track teacher course claims
CREATE TABLE IF NOT EXISTS public.course_claims (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_code text NOT NULL,
  claimed_at timestamp with time zone DEFAULT now(),
  UNIQUE(course_id, teacher_id)
);

-- Enable RLS on course_claims
ALTER TABLE public.course_claims ENABLE ROW LEVEL SECURITY;

-- Create policies for course_claims
CREATE POLICY "admin can manage all course claims" 
ON public.course_claims 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "teachers can read their own claims" 
ON public.course_claims 
FOR SELECT 
USING (teacher_id = auth.uid());

CREATE POLICY "teachers can create claims" 
ON public.course_claims 
FOR INSERT 
WITH CHECK (teacher_id = auth.uid());

-- Create storage bucket for course materials
INSERT INTO storage.buckets (id, name, public) VALUES ('course-materials', 'course-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for course materials
CREATE POLICY "admin can manage all course material files" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'course-materials' AND is_admin())
WITH CHECK (bucket_id = 'course-materials' AND is_admin());

CREATE POLICY "teachers can upload to their courses" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'course-materials' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "teachers can read their course materials" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'course-materials' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "students can read course materials they're enrolled in" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'course-materials' 
  AND EXISTS (
    SELECT 1 FROM enrollments e 
    JOIN courses c ON c.id = e.course_id 
    WHERE e.student_id = auth.uid() 
    AND (storage.foldername(name))[2] = c.id::text
  )
);

-- Update trigger for course_materials
CREATE TRIGGER update_course_materials_updated_at
BEFORE UPDATE ON public.course_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();