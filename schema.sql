-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- Insert default roles if they don't exist
INSERT INTO public.roles (name) VALUES 
('Admin'), ('Employee'), ('HR Officer'), ('Payroll Officer')
ON CONFLICT (name) DO NOTHING;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.roles(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Secure function to get current user role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_name TEXT;
BEGIN
  SELECT r.name INTO role_name
  FROM public.user_profiles up
  JOIN public.roles r ON up.role_id = r.id
  WHERE up.id = auth.uid();
  
  RETURN COALESCE(role_name, 'none');
END;
$$;

-- Drop existing policies if any
DROP POLICY IF EXISTS "All authenticated users can view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "HR Officers can update profiles" ON public.user_profiles;

-- Create policies for user_profiles

-- Everyone can view profiles (Directory feature)
CREATE POLICY "All authenticated users can view profiles" 
ON public.user_profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Admin has full access
CREATE POLICY "Admins have full access to profiles" 
ON public.user_profiles 
FOR ALL 
USING (public.get_current_user_role() = 'Admin');

-- HR Officers can update profiles
CREATE POLICY "HR Officers can update profiles" 
ON public.user_profiles 
FOR UPDATE 
USING (public.get_current_user_role() = 'HR Officer');

-- HR Officers can insert profiles
CREATE POLICY "HR Officers can insert profiles" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (public.get_current_user_role() = 'HR Officer');
