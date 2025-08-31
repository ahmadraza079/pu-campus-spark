-- Allow unauthenticated users to read admin profiles by username for login purposes
CREATE POLICY "Allow admin profile lookup for login" 
ON public.profiles 
FOR SELECT 
TO anon
USING (role = 'admin' AND username IS NOT NULL);