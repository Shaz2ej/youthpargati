-- Migration script to fix the RLS policy for purchases table
-- This fixes the "new row violates row-level security policy" error

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow students to insert their own purchases" ON purchases;

-- Create the corrected policy
CREATE POLICY "Allow students to insert their own purchases" ON purchases
FOR INSERT WITH CHECK (
    -- Directly check if the student_id being inserted exists in the students table
    -- AND is linked to the CURRENT authenticated user's UID
    student_id IN (
        SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
    )
);

-- Update the policy for viewing purchases as well
DROP POLICY IF EXISTS "Students can view own purchases" ON purchases;
CREATE POLICY "Students can view own purchases" ON purchases
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );