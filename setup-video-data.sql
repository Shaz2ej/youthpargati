-- Complete Video Setup SQL - Run this in Supabase SQL Editor
-- This will create tables and add real video URLs for testing

-- First, create the database tables (if they don't exist)
-- Run the fix-courses-table.sql first, then run this

-- Add sample video data with real YouTube URLs for testing
-- Note: These are sample educational videos - replace with your own content

DO $$
DECLARE
    course_id_1 UUID;
    course_id_2 UUID;
    course_id_3 UUID;
BEGIN
    -- Get some course IDs (assuming courses exist from fix-courses-table.sql)
    SELECT id INTO course_id_1 FROM courses WHERE title = 'Introduction to Digital Marketing' LIMIT 1;
    SELECT id INTO course_id_2 FROM courses WHERE title = 'Advanced SEO Techniques' LIMIT 1;
    SELECT id INTO course_id_3 FROM courses WHERE title = 'Social Media Strategy' LIMIT 1;

    -- Add sample videos for course 1
    IF course_id_1 IS NOT NULL THEN
        INSERT INTO course_videos (course_id, title, description, video_url, duration, order_index, is_active) VALUES
        (course_id_1, 'What is Digital Marketing?', 'Introduction to digital marketing fundamentals', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '10:32', 1, true),
        (course_id_1, 'Digital Marketing Strategy', 'Learn how to create effective digital marketing strategies', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', '8:45', 2, true),
        (course_id_1, 'Understanding Your Audience', 'How to research and understand your target audience', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', '6:12', 3, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Add sample videos for course 2
    IF course_id_2 IS NOT NULL THEN
        INSERT INTO course_videos (course_id, title, description, video_url, duration, order_index, is_active) VALUES
        (course_id_2, 'SEO Fundamentals', 'Basic concepts of search engine optimization', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', '12:20', 1, true),
        (course_id_2, 'Keyword Research', 'How to find and target the right keywords', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', '9:15', 2, true),
        (course_id_2, 'Technical SEO', 'Advanced technical optimization techniques', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', '15:30', 3, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Add sample videos for course 3
    IF course_id_3 IS NOT NULL THEN
        INSERT INTO course_videos (course_id, title, description, video_url, duration, order_index, is_active) VALUES
        (course_id_3, 'Social Media Platforms', 'Overview of major social media platforms', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', '7:45', 1, true),
        (course_id_3, 'Content Creation', 'How to create engaging social media content', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', '11:22', 2, true),
        (course_id_3, 'Social Media Analytics', 'Measuring and analyzing social media performance', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Subaru.mp4', '8:30', 3, true)
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Added sample video data with real URLs';
END $$;

-- Verify the data was inserted
SELECT 
    c.title as course_title,
    cv.title as video_title,
    cv.video_url,
    cv.duration,
    cv.order_index
FROM course_videos cv
JOIN courses c ON cv.course_id = c.id
ORDER BY c.title, cv.order_index;