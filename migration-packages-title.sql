-- Migration: Update packages table from name to title column
-- Run this SQL in your Supabase SQL Editor to update existing database

-- Step 1: Add the title column if it doesn't exist
ALTER TABLE packages ADD COLUMN IF NOT EXISTS title TEXT;

-- Step 2: Copy data from name to title column (if name column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'packages' AND column_name = 'name') THEN
        UPDATE packages SET title = name WHERE title IS NULL;
    END IF;
END $$;

-- Step 3: Make title column NOT NULL after data migration
ALTER TABLE packages ALTER COLUMN title SET NOT NULL;

-- Step 4: Drop the old name column if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'packages' AND column_name = 'name') THEN
        ALTER TABLE packages DROP COLUMN name;
    END IF;
END $$;

-- Step 5: Add thumbnail_url column if it doesn't exist
ALTER TABLE packages ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Verification: Check the updated table structure
-- Uncomment the next line to verify the changes
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'packages' ORDER BY ordinal_position;