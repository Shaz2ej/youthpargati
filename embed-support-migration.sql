-- Embed Code Support Migration for Course Videos
-- Run this SQL in your Supabase SQL Editor

-- Add embed_code column to course_videos table
DO $$ 
BEGIN
    -- Add embed_code column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'course_videos' AND column_name = 'embed_code') THEN
        ALTER TABLE course_videos ADD COLUMN embed_code TEXT;
        RAISE NOTICE 'Added embed_code column to course_videos table';
    ELSE
        RAISE NOTICE 'embed_code column already exists in course_videos table';
    END IF;

    -- Modify video_url to allow NULL (since we might have embed_code instead)
    -- First check if the constraint allows NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'course_videos' 
        AND column_name = 'video_url' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE course_videos ALTER COLUMN video_url DROP NOT NULL;
        RAISE NOTICE 'Made video_url column nullable to support embed_code only videos';
    END IF;

    -- Add a check constraint to ensure at least one of video_url or embed_code is provided
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'course_videos' 
        AND constraint_name = 'course_videos_url_or_embed_check'
    ) THEN
        ALTER TABLE course_videos 
        ADD CONSTRAINT course_videos_url_or_embed_check 
        CHECK (video_url IS NOT NULL OR embed_code IS NOT NULL);
        RAISE NOTICE 'Added constraint to ensure either video_url or embed_code is provided';
    END IF;

END $$;

-- Update the select policy to include embed_code
DROP POLICY IF EXISTS "Anyone can view active course videos" ON course_videos;
CREATE POLICY "Anyone can view active course videos" ON course_videos
    FOR SELECT USING (is_active = true);

-- Add some sample embed codes for testing (optional)
-- Uncomment these if you want to test with sample data

/*
DO $$
DECLARE
    sample_course_id UUID;
BEGIN
    -- Get a sample course ID
    SELECT id INTO sample_course_id FROM courses LIMIT 1;
    
    IF sample_course_id IS NOT NULL THEN
        -- Add a YouTube embed example
        INSERT INTO course_videos (
            course_id, 
            title, 
            description, 
            embed_code, 
            duration, 
            order_index, 
            is_active
        ) VALUES (
            sample_course_id,
            'Sample YouTube Embed Video',
            'This video uses YouTube embed code instead of direct URL',
            '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>',
            '3:32',
            99,
            true
        ) ON CONFLICT DO NOTHING;

        -- Add a Vimeo embed example
        INSERT INTO course_videos (
            course_id, 
            title, 
            description, 
            embed_code, 
            duration, 
            order_index, 
            is_active
        ) VALUES (
            sample_course_id,
            'Sample Vimeo Embed Video',
            'This video uses Vimeo embed code instead of direct URL',
            '<iframe src="https://player.vimeo.com/video/90509568?h=4c4c4c4c4c" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>',
            '5:14',
            98,
            true
        ) ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Added sample embed code videos for testing';
    END IF;
END $$;
*/

-- Verification query to check the new structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'course_videos' 
AND column_name IN ('video_url', 'embed_code')
ORDER BY column_name;

-- Show any existing videos with their new columns
-- SELECT 
--     id,
--     title,
--     CASE 
--         WHEN video_url IS NOT NULL THEN 'URL: ' || LEFT(video_url, 50) || '...'
--         WHEN embed_code IS NOT NULL THEN 'EMBED: ' || LEFT(embed_code, 50) || '...'
--         ELSE 'NO VIDEO SOURCE'
--     END as video_source_preview
-- FROM course_videos 
-- ORDER BY created_at DESC
-- LIMIT 10;