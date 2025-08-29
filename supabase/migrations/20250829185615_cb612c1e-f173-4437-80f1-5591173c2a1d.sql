-- First, drop existing tables and constraints that don't match new schema
DROP TABLE IF EXISTS profiles CASCADE;

-- Create enums
CREATE TYPE role_type AS ENUM ('student','teacher','admin');
CREATE TYPE attendance_status AS ENUM ('Present','Absent');
CREATE TYPE grade_letter AS ENUM ('A','B','C','D','F');

-- PROFILES (one row per auth user)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_type NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  teacher_id text UNIQUE,
  voucher_number text UNIQUE,
  username text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- COURSES
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  access_code text NOT NULL UNIQUE,
  teacher_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ENROLLMENTS (student ↔ course)
CREATE TABLE enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  grade grade_letter,
  UNIQUE (student_id, course_id)
);

-- ATTENDANCE
CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  marked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  class_date date NOT NULL,
  status attendance_status NOT NULL,
  UNIQUE (course_id, student_id, class_date)
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  created_at timestamptz DEFAULT now(),
  details jsonb
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: is_admin()
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

-- PROFILES policies
CREATE POLICY "read own profile" ON profiles FOR SELECT
USING (id = auth.uid() OR is_admin());

CREATE POLICY "update own profile" ON profiles FOR UPDATE
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "admin full profiles" ON profiles FOR ALL 
USING (is_admin()) WITH CHECK (is_admin());

-- COURSES policies
CREATE POLICY "course read" ON courses FOR SELECT
USING (
  is_admin() OR
  teacher_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM enrollments e WHERE e.course_id = courses.id AND e.student_id = auth.uid()
  )
);

CREATE POLICY "course insert by teacher" ON courses FOR INSERT
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "course update by owner" ON courses FOR UPDATE
USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "admin full courses" ON courses FOR ALL 
USING (is_admin()) WITH CHECK (is_admin());

-- ENROLLMENTS policies
CREATE POLICY "enroll read" ON enrollments FOR SELECT
USING (
  is_admin() OR
  student_id = auth.uid() OR
  EXISTS (SELECT 1 FROM courses c WHERE c.id = enrollments.course_id AND c.teacher_id = auth.uid())
);

CREATE POLICY "enroll insert by course teacher" ON enrollments FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = enrollments.course_id AND c.teacher_id = auth.uid())
);

CREATE POLICY "enroll delete by course teacher" ON enrollments FOR DELETE
USING (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = enrollments.course_id AND c.teacher_id = auth.uid())
);

CREATE POLICY "admin full enrollments" ON enrollments FOR ALL 
USING (is_admin()) WITH CHECK (is_admin());

-- ATTENDANCE policies
CREATE POLICY "attendance read" ON attendance FOR SELECT
USING (
  is_admin() OR
  student_id = auth.uid() OR
  EXISTS (SELECT 1 FROM courses c WHERE c.id = attendance.course_id AND c.teacher_id = auth.uid())
);

CREATE POLICY "attendance insert by course teacher" ON attendance FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = attendance.course_id AND c.teacher_id = auth.uid())
);

CREATE POLICY "attendance update by course teacher" ON attendance FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = attendance.course_id AND c.teacher_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM courses c WHERE c.id = attendance.course_id AND c.teacher_id = auth.uid())
);

CREATE POLICY "admin full attendance" ON attendance FOR ALL 
USING (is_admin()) WITH CHECK (is_admin());

-- AUDIT policies
CREATE POLICY "audit insert self" ON audit_logs FOR INSERT 
WITH CHECK (actor_id = auth.uid());

CREATE POLICY "audit read admin" ON audit_logs FOR SELECT 
USING (is_admin());

-- Update the handle_new_user function for new schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, phone, teacher_id, voucher_number, username)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data ->> 'role')::role_type,
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'teacher_id',
    NEW.raw_user_meta_data ->> 'voucher_number',
    NEW.raw_user_meta_data ->> 'username'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();