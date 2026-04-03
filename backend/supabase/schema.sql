-- Supabase Database Schema for Jackson Hacks
-- This file tracks the database structures used in the Supabase Cloud.

CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'waitlisted')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  dietary_restrictions TEXT,
  tshirt_size TEXT CHECK (tshirt_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  why_attend TEXT NOT NULL,
  project_idea TEXT,
  heard_from TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  agree_to_terms BOOLEAN DEFAULT FALSE NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for registration)
CREATE POLICY "Anyone can submit applications" ON applications
  FOR INSERT WITH CHECK (true);

-- Users can read their own application
CREATE POLICY "Users can view own application" ON applications
  FOR SELECT USING (auth.uid() = user_id);
