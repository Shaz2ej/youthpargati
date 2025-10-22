-- Migration script to update the RLS policy for purchases table
-- This uses auth.uid() instead of auth.jwt() for better compatibility

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow self insert on purchases" ON purchases;

-- Create the new policy using auth.uid()
CREATE POLICY "Allow self insert on purchases"
ON purchases
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid()::uuid = student_id));