-- Production Database Schema for Yoga Class Scheduling System
-- This file contains the complete schema without sample data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT DEFAULT 'avatar.png',
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create yoga_classes table
CREATE TABLE yoga_classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  brief_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  instructor TEXT NOT NULL DEFAULT 'Sarah',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  weekly_repeat INTEGER NOT NULL DEFAULT 0 CHECK (weekly_repeat >= 0 AND weekly_repeat <= 26),
  is_cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_registrations table
CREATE TABLE class_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES yoga_classes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  square_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, user_id)
);

-- Create waivers table
CREATE TABLE waivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_waivers table
CREATE TABLE user_waivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  waiver_id UUID NOT NULL REFERENCES waivers(id) ON DELETE CASCADE,
  agreed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  waiver_snapshot_md TEXT NOT NULL,
  UNIQUE(user_id, waiver_id)
);

-- Create indexes for better performance
CREATE INDEX idx_yoga_classes_start_time ON yoga_classes(start_time);
CREATE INDEX idx_yoga_classes_instructor ON yoga_classes(instructor);
CREATE INDEX idx_yoga_classes_is_cancelled ON yoga_classes(is_cancelled);
CREATE INDEX idx_class_registrations_class_id ON class_registrations(class_id);
CREATE INDEX idx_class_registrations_user_id ON class_registrations(user_id);
CREATE INDEX idx_class_registrations_payment_status ON class_registrations(payment_status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_yoga_classes_updated_at BEFORE UPDATE ON yoga_classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_registrations_updated_at BEFORE UPDATE ON class_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_waivers_updated_at BEFORE UPDATE ON waivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_waivers_updated_at BEFORE UPDATE ON user_waivers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, FALSE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_waivers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to create their own profile (for users created before trigger, or if profile is missing)
CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Yoga classes policies (public read, admin write)
CREATE POLICY "Anyone can view non-cancelled classes" ON yoga_classes
  FOR SELECT USING (is_cancelled = FALSE);

CREATE POLICY "Authenticated users can view all classes" ON yoga_classes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin policies (you'll need to set up admin role)
CREATE POLICY "Admins can manage all classes" ON yoga_classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

-- Class registrations policies
CREATE POLICY "Users can view their own registrations" ON class_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations" ON class_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON class_registrations
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin can view all registrations for classes they manage
CREATE POLICY "Admins can view all registrations" ON class_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

-- Admin can update all registrations
CREATE POLICY "Admins can update all registrations" ON class_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

-- Waivers policies
CREATE POLICY "Select active waivers (public)" ON waivers
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admin manage waivers" ON waivers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

-- User waivers policies
CREATE POLICY "Users select own user_waivers" ON user_waivers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own user_waivers" ON user_waivers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin select all user_waivers" ON user_waivers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

-- Create views for easier querying

-- View for class details with registration count
CREATE VIEW class_details AS
SELECT 
  yc.*,
  COUNT(cr.id) as registration_count,
  COALESCE(SUM(cr.payment_amount), 0) as total_revenue
FROM yoga_classes yc
LEFT JOIN class_registrations cr ON yc.id = cr.class_id AND cr.payment_status = 'completed'
GROUP BY yc.id;

-- View for user registrations with class details
CREATE VIEW user_registrations AS
SELECT 
  cr.*,
  yc.name as class_name,
  yc.start_time,
  yc.end_time,
  yc.instructor,
  yc.is_cancelled
FROM class_registrations cr
JOIN yoga_classes yc ON cr.class_id = yc.id;

-- Seed an initial active waiver if none exists
INSERT INTO waivers (version, title, body_markdown, is_active)
SELECT 1,
       'Standard Yoga Participation Waiver',
       '# Participation Waiver\n\nBy registering, you acknowledge the inherent risks of physical activity and agree to participate responsibly. You certify that you are in suitable health and will inform the instructor of any conditions. You release the organizer and instructors from liability to the fullest extent permitted by law.',
       TRUE
WHERE NOT EXISTS (SELECT 1 FROM waivers);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
