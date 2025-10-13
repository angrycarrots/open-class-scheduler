-- Add DELETE policies for class_registrations table

-- Allow users to delete their own registrations
CREATE POLICY "Users can delete their own registrations" ON class_registrations
  FOR DELETE USING (auth.uid() = user_id);

-- Allow admins to delete all registrations
CREATE POLICY "Admins can delete all registrations" ON class_registrations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_admin = TRUE
    )
  );

