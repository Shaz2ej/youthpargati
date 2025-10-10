-- Migration script to add commission_amount column to packages table
-- Run this SQL command in your Supabase SQL Editor

-- Add commission_amount column to packages table (if it doesn't exist)
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10,2) DEFAULT 0.00;

-- Note: The commission_amount column already contains the fixed commission values
-- No need to update existing packages as values are already set in the database

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_packages_commission_amount ON packages(commission_amount);