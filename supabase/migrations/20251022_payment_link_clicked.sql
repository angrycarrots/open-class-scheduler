-- Option A: Track whether a user clicked any payment link per registration
-- Non-destructive migration: adds enum, columns, and index

-- Create enum for payment link methods if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'payment_link_method'
  ) THEN
    CREATE TYPE payment_link_method AS ENUM ('venmo', 'paypal', 'zelle', 'square');
  END IF;
END $$;

-- Add columns to class_registrations (additive, non-destructive)
ALTER TABLE public.class_registrations
  ADD COLUMN IF NOT EXISTS payment_link_clicked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_link_clicked_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_link_method payment_link_method;

-- Helpful index for filtering/analytics
CREATE INDEX IF NOT EXISTS class_registrations_payment_clicked_idx
  ON public.class_registrations (payment_link_clicked);
