-- Add missing foreign key constraint for claimed_by in courses table
ALTER TABLE public.courses 
ADD CONSTRAINT courses_claimed_by_fkey 
FOREIGN KEY (claimed_by) REFERENCES public.profiles(id);