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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create yoga_classes table
CREATE TABLE yoga_classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  brief_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  instructor TEXT NOT NULL DEFAULT 'Michael',
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

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
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

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

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
      AND email = 'admin@example.com'
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
      AND email = 'admin@example.com'
    )
  );

-- Admin can update all registrations
CREATE POLICY "Admins can update all registrations" ON class_registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND email = 'admin@example.com'
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
