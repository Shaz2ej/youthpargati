-- Migration script to rename firebase_uid column to supabase_auth_uid in students table
-- Run this SQL command in your Supabase SQL Editor

-- Rename the column
ALTER TABLE students RENAME COLUMN firebase_uid TO supabase_auth_uid;

-- Update the index
DROP INDEX IF EXISTS idx_students_firebase_uid;
CREATE INDEX IF NOT EXISTS idx_students_supabase_auth_uid ON students(supabase_auth_uid);

-- Update RLS policies to use the new column name
DROP POLICY IF EXISTS "Students can view own data" ON students;
CREATE POLICY "Students can view own data" ON students
    FOR SELECT USING (supabase_auth_uid = auth.jwt() ->> 'sub');

DROP POLICY IF EXISTS "Students can update own data" ON students;
CREATE POLICY "Students can update own data" ON students
    FOR UPDATE USING (supabase_auth_uid = auth.jwt() ->> 'sub');

-- Update purchases policies
DROP POLICY IF EXISTS "Students can view own purchases" ON purchases;
CREATE POLICY "Students can view own purchases" ON purchases
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );

-- Update the insert policy for purchases
DROP POLICY IF EXISTS "Allow students to insert their own purchases" ON purchases;
CREATE POLICY "Allow students to insert their own purchases" ON purchases
FOR INSERT WITH CHECK (
    student_id IN (
        SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
    )
);

-- Update withdrawals policies
DROP POLICY IF EXISTS "Students can view own withdrawals" ON withdrawals;
CREATE POLICY "Students can view own withdrawals" ON withdrawals
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );

DROP POLICY IF EXISTS "Students can create own withdrawals" ON withdrawals;
CREATE POLICY "Students can create own withdrawals" ON withdrawals
    FOR INSERT WITH CHECK (
        student_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );

-- Update affiliates policies
DROP POLICY IF EXISTS "Students can view own affiliate data" ON affiliates;
CREATE POLICY "Students can view own affiliate data" ON affiliates
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );

-- Update referrals policies
DROP POLICY IF EXISTS "Students can view own referrals" ON referrals;
CREATE POLICY "Students can view own referrals" ON referrals
    FOR SELECT USING (
        referrer_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );

-- Update user_referral_codes policies
DROP POLICY IF EXISTS "Students can view own referral codes" ON user_referral_codes;
CREATE POLICY "Students can view own referral codes" ON user_referral_codes
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );