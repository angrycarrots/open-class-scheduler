DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'payment_link_method'
      AND e.enumlabel = 'cash'
  ) THEN
    ALTER TYPE payment_link_method ADD VALUE 'cash';
  END IF;
END $$;
