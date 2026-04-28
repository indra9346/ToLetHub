-- Fix house RLS: owners should manage their own houses based on ownership alone.
-- The previous policies required BOTH owner_id match AND admin role, which was redundant
-- and could lock owners out if their role changed.

DROP POLICY IF EXISTS "Owners can update their houses" ON public.houses;
DROP POLICY IF EXISTS "Owners can delete their houses" ON public.houses;
DROP POLICY IF EXISTS "Admins can insert houses" ON public.houses;

-- Only users with the 'admin' role (i.e. registered house owners) can create listings,
-- and the new row must belong to them.
CREATE POLICY "Owners can insert their own houses"
ON public.houses
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = owner_id
  AND public.has_role(auth.uid(), 'admin')
);

-- Owners can update only their own listings.
CREATE POLICY "Owners can update their own houses"
ON public.houses
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Owners can delete only their own listings.
CREATE POLICY "Owners can delete their own houses"
ON public.houses
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);
