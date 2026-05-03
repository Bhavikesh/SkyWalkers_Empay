-- Extend profiles table with personal info fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS personal_email TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS marital_status TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT;
