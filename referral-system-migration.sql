-- Migration script for the new referral system
-- Run these SQL commands in your Supabase SQL Editor

-- Create the user_referral_codes table
CREATE TABLE IF NOT EXISTS user_referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES students(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    referral_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_referral_codes_user_id ON user_referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_codes_package_id ON user_referral_codes(package_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_codes_referral_code ON user_referral_codes(referral_code);

-- Add RLS policies for user_referral_codes
ALTER TABLE user_referral_codes ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral codes
CREATE POLICY "Users can view own referral codes" ON user_referral_codes
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM students WHERE firebase_uid = auth.jwt() ->> 'sub'
        )
    );

-- Function to increment a value
CREATE OR REPLACE FUNCTION increment(value INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN value + 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate referral codes when a user purchases a package
-- This would need to be called from the application when a purchase is completed