-- Helper to check admin status without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT is_admin
      FROM profiles
      WHERE id = auth.uid()
    ),
    FALSE
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- Profiles admin visibility policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (public.is_admin());

-- Yoga classes admin management policy
DROP POLICY IF EXISTS "Admins can manage all classes" ON yoga_classes;
CREATE POLICY "Admins can manage all classes" ON yoga_classes
  FOR ALL
  USING (public.is_admin());

-- Class registrations admin policies
DROP POLICY IF EXISTS "Admins can view all registrations" ON class_registrations;
CREATE POLICY "Admins can view all registrations" ON class_registrations
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all registrations" ON class_registrations;
CREATE POLICY "Admins can update all registrations" ON class_registrations
  FOR UPDATE
  USING (public.is_admin());

-- Waivers admin management policy
DROP POLICY IF EXISTS "Admin manage waivers" ON waivers;
CREATE POLICY "Admin manage waivers" ON waivers
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- User waivers admin read policy
DROP POLICY IF EXISTS "Admin select all user_waivers" ON user_waivers;
CREATE POLICY "Admin select all user_waivers" ON user_waivers
  FOR SELECT
  USING (public.is_admin());
