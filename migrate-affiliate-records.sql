-- Migration script to ensure all existing students have affiliate records
-- This script should be run once to create affiliate records for any students that don't have them

-- Insert affiliate records for students that don't already have one
INSERT INTO affiliates (student_id, referral_code, total_leads, total_commission)
SELECT s.id, s.referral_code, 0, 0
FROM students s
WHERE NOT EXISTS (
    SELECT 1 
    FROM affiliates a 
    WHERE a.student_id = s.id
);

-- Verify the migration
SELECT COUNT(*) as total_students FROM students;
SELECT COUNT(*) as total_affiliates FROM affiliates;