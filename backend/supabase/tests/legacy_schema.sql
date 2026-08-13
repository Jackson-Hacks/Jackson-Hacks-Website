CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'waitlisted')),
  full_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, age INTEGER, school TEXT NOT NULL,
  grade TEXT NOT NULL, experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  dietary_restrictions TEXT, tshirt_size TEXT CHECK (tshirt_size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL')),
  why_attend TEXT NOT NULL, project_idea TEXT, heard_from TEXT, emergency_contact_name TEXT,
  emergency_contact_phone TEXT, agree_to_terms BOOLEAN DEFAULT FALSE NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);
CREATE TABLE admin_users (user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()); $$;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can submit own application" ON applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own application" ON applications FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can update own application" ON applications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view own admin row" ON admin_users FOR SELECT USING (auth.uid() = user_id);
