-- Combined schema migration for Yoga Class Scheduler
-- Includes core tables, waivers, triggers, policies, seed data, and grants

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS yoga_classes (
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
CREATE TABLE IF NOT EXISTS class_registrations (
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
CREATE TABLE IF NOT EXISTS waivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_waivers table
CREATE TABLE IF NOT EXISTS user_waivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  waiver_id UUID NOT NULL REFERENCES waivers(id) ON DELETE CASCADE,
  agreed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  waiver_snapshot_md TEXT NOT NULL,
  UNIQUE(user_id, waiver_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_yoga_classes_start_time ON yoga_classes(start_time);
CREATE INDEX IF NOT EXISTS idx_yoga_classes_instructor ON yoga_classes(instructor);
CREATE INDEX IF NOT EXISTS idx_yoga_classes_is_cancelled ON yoga_classes(is_cancelled);
CREATE INDEX IF NOT EXISTS idx_class_registrations_class_id ON class_registrations(class_id);
CREATE INDEX IF NOT EXISTS idx_class_registrations_user_id ON class_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_class_registrations_payment_status ON class_registrations(payment_status);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_yoga_classes_updated_at'
  ) THEN
    CREATE TRIGGER update_yoga_classes_updated_at BEFORE UPDATE ON yoga_classes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_class_registrations_updated_at'
  ) THEN
    CREATE TRIGGER update_class_registrations_updated_at BEFORE UPDATE ON class_registrations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_waivers_updated_at'
  ) THEN
    CREATE TRIGGER update_waivers_updated_at BEFORE UPDATE ON waivers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_waivers_updated_at'
  ) THEN
    CREATE TRIGGER update_user_waivers_updated_at BEFORE UPDATE ON user_waivers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

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
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    is_admin = EXCLUDED.is_admin,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_waivers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can create their own profile'
  ) THEN
    CREATE POLICY "Users can create their own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Yoga classes policies (public read, admin write)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'yoga_classes' AND policyname = 'Anyone can view non-cancelled classes'
  ) THEN
    CREATE POLICY "Anyone can view non-cancelled classes" ON yoga_classes
      FOR SELECT USING (is_cancelled = FALSE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'yoga_classes' AND policyname = 'Authenticated users can view all classes'
  ) THEN
    CREATE POLICY "Authenticated users can view all classes" ON yoga_classes
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'yoga_classes' AND policyname = 'Admins can manage all classes'
  ) THEN
    CREATE POLICY "Admins can manage all classes" ON yoga_classes
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND is_admin = TRUE
        )
      );
  END IF;
END $$;

-- Class registrations policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'class_registrations' AND policyname = 'Users can view their own registrations'
  ) THEN
    CREATE POLICY "Users can view their own registrations" ON class_registrations
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'class_registrations' AND policyname = 'Users can create their own registrations'
  ) THEN
    CREATE POLICY "Users can create their own registrations" ON class_registrations
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'class_registrations' AND policyname = 'Users can update their own registrations'
  ) THEN
    CREATE POLICY "Users can update their own registrations" ON class_registrations
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'class_registrations' AND policyname = 'Admins can view all registrations'
  ) THEN
    CREATE POLICY "Admins can view all registrations" ON class_registrations
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND is_admin = TRUE
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'class_registrations' AND policyname = 'Admins can update all registrations'
  ) THEN
    CREATE POLICY "Admins can update all registrations" ON class_registrations
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND is_admin = TRUE
        )
      );
  END IF;
END $$;

-- Waivers policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waivers' AND policyname = 'Select active waivers (public)'
  ) THEN
    CREATE POLICY "Select active waivers (public)" ON waivers
      FOR SELECT USING (is_active = TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'waivers' AND policyname = 'Admin manage waivers'
  ) THEN
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
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_waivers' AND policyname = 'Users select own user_waivers'
  ) THEN
    CREATE POLICY "Users select own user_waivers" ON user_waivers
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_waivers' AND policyname = 'Users insert own user_waivers'
  ) THEN
    CREATE POLICY "Users insert own user_waivers" ON user_waivers
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_waivers' AND policyname = 'Admin select all user_waivers'
  ) THEN
    CREATE POLICY "Admin select all user_waivers" ON user_waivers
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND is_admin = TRUE
        )
      );
  END IF;
END $$;

-- Views for easier querying
CREATE OR REPLACE VIEW class_details AS
SELECT 
  yc.*,
  COUNT(cr.id) as registration_count,
  COALESCE(SUM(CASE WHEN cr.payment_status = 'completed' THEN cr.payment_amount ELSE 0 END), 0) as total_revenue
FROM yoga_classes yc
LEFT JOIN class_registrations cr ON yc.id = cr.class_id
GROUP BY yc.id;

CREATE OR REPLACE VIEW user_registrations AS
SELECT 
  cr.*,
  yc.name as class_name,
  yc.start_time,
  yc.end_time,
  yc.instructor,
  yc.is_cancelled
FROM class_registrations cr
JOIN yoga_classes yc ON cr.class_id = yc.id;

-- Seed an initial active waiver only if none exists
INSERT INTO waivers (version, title, body_markdown, is_active)
SELECT 1,
       'Standard Yoga Participation Waiver',
       '# Participation Waiver\n\nBy registering, you acknowledge the inherent risks of physical activity and agree to participate responsibly. You certify that you are in suitable health and will inform the instructor of any conditions. You release the organizer and instructors from liability to the fullest extent permitted by law.',
       TRUE
WHERE NOT EXISTS (SELECT 1 FROM waivers);

-- Seed sample yoga classes (dev convenience)
INSERT INTO yoga_classes (name, brief_description, full_description, instructor, start_time, end_time, price, weekly_repeat) VALUES
('Deep Stretch at the Rose Garden', 'Gentle stretching and flexibility work in a beautiful garden setting', 'A relaxing class focused on deep stretching and flexibility work. Perfect for releasing tension and improving range of motion. Held in the serene Rose Garden environment.', 'Sarah', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', 12.00, 0),
('Moon Sequence at the Rose Garden', 'Evening yoga under the moonlight', 'A peaceful evening practice designed to help you unwind and connect with your inner self. This gentle flow is perfect for ending your day mindfully.', 'Alex', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', 10.00, 0),
('Sunrise Flow', 'Energizing morning practice to start your day', 'Begin your day with this invigorating morning flow that combines dynamic movement with mindful breathing. Perfect for building energy and focus for the day ahead.', 'Jordan', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '1.5 hours', 15.00, 0),
('Gentle Hatha', 'Traditional yoga practice for all levels', 'A traditional Hatha yoga class suitable for all levels. Focus on proper alignment, breathing, and mindful movement in a supportive environment.', 'Taylor', NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days' + INTERVAL '1 hour', 8.00, 0),
('Vinyasa Flow', 'Dynamic movement synchronized with breath', 'A dynamic and flowing practice that links movement with breath. This intermediate-level class builds strength, flexibility, and mindfulness.', 'Casey', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '1.5 hours', 12.00, 0),
('Restorative Evening', 'Deep relaxation and stress relief', 'A deeply relaxing class using props to support the body in passive poses. Perfect for stress relief and recovery after a busy day.', 'Morgan', NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days' + INTERVAL '1 hour', 10.00, 0),
('Weekly Meditation', 'Mindfulness and meditation practice', 'A weekly meditation class combining breathing techniques, mindfulness practices, and guided meditation for stress reduction and mental clarity.', 'Riley', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '45 minutes', 8.00, 4)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
