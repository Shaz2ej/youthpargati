-- Migration: Rename video_url to video_embed for embed-only system
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Rename the column
DO $$ 
BEGIN
    -- Check if video_url column exists and video_embed doesn't
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'course_videos' AND column_name = 'video_url') 
       AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'course_videos' AND column_name = 'video_embed') THEN
        
        ALTER TABLE course_videos RENAME COLUMN video_url TO video_embed;
        RAISE NOTICE 'Renamed video_url column to video_embed';
        
    ELSIF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'course_videos' AND column_name = 'video_embed') THEN
        RAISE NOTICE 'video_embed column already exists - no migration needed';
        
    ELSE
        RAISE NOTICE 'Neither video_url nor video_embed column found - creating video_embed column';
        ALTER TABLE course_videos ADD COLUMN video_embed TEXT;
    END IF;
END $$;

-- Step 2: Remove embed_code column if it exists (since we're consolidating to video_embed)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'course_videos' AND column_name = 'embed_code') THEN
        ALTER TABLE course_videos DROP COLUMN embed_code;
        RAISE NOTICE 'Removed old embed_code column';
    END IF;
END $$;

-- Step 3: Update constraint to ensure video_embed is provided
DO $$
BEGIN
    -- Remove old constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'course_videos' 
        AND constraint_name = 'course_videos_url_or_embed_check'
    ) THEN
        ALTER TABLE course_videos DROP CONSTRAINT course_videos_url_or_embed_check;
        RAISE NOTICE 'Removed old URL/embed constraint';
    END IF;
    
    -- Add new constraint for embed-only system
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'course_videos' 
        AND constraint_name = 'course_videos_embed_required'
    ) THEN
        ALTER TABLE course_videos 
        ADD CONSTRAINT course_videos_embed_required 
        CHECK (video_embed IS NOT NULL AND trim(video_embed) != '');
        RAISE NOTICE 'Added constraint to ensure video_embed is provided';
    END IF;
END $$;

-- Step 4: Add sample embed code data for testing (optional)
-- Uncomment this section if you want to add sample data

/*
DO $$
DECLARE
    sample_course_id UUID;
BEGIN
    -- Get a sample course ID
    SELECT id INTO sample_course_id FROM courses LIMIT 1;
    
    IF sample_course_id IS NOT NULL THEN
        -- Clear any existing sample data first
        DELETE FROM course_videos WHERE course_id = sample_course_id AND title LIKE '%Sample%';
        
        -- Add sample embed videos
        INSERT INTO course_videos (
            course_id, 
            title, 
            description, 
            video_embed, 
            duration, 
            order_index, 
            is_active
        ) VALUES 
        (
            sample_course_id,
            'Sample YouTube Embed',
            'YouTube video using iframe embed code',
            '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>',
            '3:32',
            1,
            true
        ),
        (
            sample_course_id,
            'Sample Vimeo Embed',
            'Vimeo video using iframe embed code',
            '<iframe src="https://player.vimeo.com/video/90509568" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>',
            '5:14',
            2,
            true
        ),
        (
            sample_course_id,
            'Sample Odysee Embed',
            'Odysee video using iframe embed code',
            '<iframe id="lbry-iframe" src="https://odysee.com/$/embed/@samtime:1/programming-on-windows-is-torture:5" allowfullscreen width="560" height="315"></iframe>',
            '8:45',
            3,
            true
        );

        RAISE NOTICE 'Added sample embed code videos for testing';
    END IF;
END $$;
*/

-- Step 5: Verification - Check the new structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'course_videos' 
AND column_name IN ('video_embed', 'video_url', 'embed_code')
ORDER BY column_name;

-- Show current videos and their embed status
SELECT 
    id,
    title,
    CASE 
        WHEN video_embed IS NOT NULL AND trim(video_embed) != '' THEN 'HAS_EMBED'
        ELSE 'NO_EMBED'
    END as embed_status,
    CASE 
        WHEN video_embed LIKE '%youtube.com%' THEN 'YouTube'
        WHEN video_embed LIKE '%vimeo.com%' THEN 'Vimeo'
        WHEN video_embed LIKE '%odysee.com%' THEN 'Odysee'
        WHEN video_embed LIKE '%dailymotion.com%' THEN 'Dailymotion'
        WHEN video_embed IS NOT NULL THEN 'Other'
        ELSE 'None'
    END as platform
FROM course_videos 
ORDER BY created_at DESC
LIMIT 10;