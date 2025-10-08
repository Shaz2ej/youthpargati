-- Migration script to add upi_id column to students table
-- Run this SQL command in your Supabase SQL Editor

-- Add upi_id column to students table
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS upi_id TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_students_upi_id ON students(upi_id);