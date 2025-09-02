-- Remove the unique constraint on code field since it's optional
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_code_key;