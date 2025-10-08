-- Migration script to add referral_code column to purchases table
-- Run this SQL command in your Supabase SQL Editor

-- Add referral_code column to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_purchases_referral_code ON purchases(referral_code);