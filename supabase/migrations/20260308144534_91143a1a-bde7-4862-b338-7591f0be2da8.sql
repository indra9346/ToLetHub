
-- Allow authenticated users to insert their own admin role (for owner self-promotion)
CREATE POLICY "Users can request admin role"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
