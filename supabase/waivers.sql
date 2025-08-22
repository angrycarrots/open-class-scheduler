-- Waivers & User Waivers migration (additive)
-- Safe to run multiple times

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables
CREATE TABLE IF NOT EXISTS public.waivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_waivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  waiver_id UUID NOT NULL REFERENCES public.waivers(id) ON DELETE CASCADE,
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  waiver_snapshot_md TEXT NOT NULL,
  UNIQUE(user_id, waiver_id)
);

-- updated_at trigger function (exists in schema.sql, but guard just in case)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_waivers_updated_at'
  ) THEN
    CREATE TRIGGER update_waivers_updated_at
      BEFORE UPDATE ON public.waivers
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_waivers_updated_at'
  ) THEN
    CREATE TRIGGER update_user_waivers_updated_at
      BEFORE UPDATE ON public.user_waivers
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_waivers ENABLE ROW LEVEL SECURITY;

-- Policies for waivers
-- Anyone may read the active waiver to display terms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='waivers' AND policyname='Select active waivers (public)'
  ) THEN
    CREATE POLICY "Select active waivers (public)" ON public.waivers
      FOR SELECT USING (is_active = TRUE);
  END IF;

  -- Admin can manage all waivers
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='waivers' AND policyname='Admin manage waivers'
  ) THEN
    CREATE POLICY "Admin manage waivers" ON public.waivers
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.email = 'admin@example.com'
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.email = 'admin@example.com'
        )
      );
  END IF;
END $$;

-- Policies for user_waivers
DO $$
BEGIN
  -- Users can read their own waiver records
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_waivers' AND policyname='Users select own user_waivers'
  ) THEN
    CREATE POLICY "Users select own user_waivers" ON public.user_waivers
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Users can insert their own acceptance rows
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_waivers' AND policyname='Users insert own user_waivers'
  ) THEN
    CREATE POLICY "Users insert own user_waivers" ON public.user_waivers
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Admin can view all user_waivers
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_waivers' AND policyname='Admin select all user_waivers'
  ) THEN
    CREATE POLICY "Admin select all user_waivers" ON public.user_waivers
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.email = 'admin@example.com'
        )
      );
  END IF;
END $$;

-- Seed an initial active waiver only if none exists
INSERT INTO public.waivers (version, title, body_markdown, is_active)
SELECT 1,
       'Standard Yoga Participation Waiver',
       '# Participation Waiver\n\nBy registering, you acknowledge the inherent risks of physical activity and agree to participate responsibly. You certify that you are in suitable health and will inform the instructor of any conditions. You release the organizer and instructors from liability to the fullest extent permitted by law.',
       TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.waivers);
