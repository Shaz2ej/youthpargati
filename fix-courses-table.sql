-- Fix for Missing Courses Table and Missing Columns (duration, thumbnail_url)
-- Run this SQL in your Supabase SQL Editor

-- Check if courses table exists and create/update it
DO $$ 
BEGIN
    -- Create courses table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
        CREATE TABLE courses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            duration TEXT, -- e.g., "2 hours", "45 minutes"
            thumbnail_url TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created courses table';
    ELSE
        -- Add duration column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'duration') THEN
            ALTER TABLE courses ADD COLUMN duration TEXT;
            RAISE NOTICE 'Added duration column to courses table';
        END IF;
        
        -- Add thumbnail_url column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
            ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
            RAISE NOTICE 'Added thumbnail_url column to courses table';
        END IF;
    END IF;

    -- Create package_courses table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'package_courses') THEN
        CREATE TABLE package_courses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            order_index INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(package_id, course_id)
        );
        
        RAISE NOTICE 'Created package_courses table';
    END IF;

    -- Create course_videos table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_videos') THEN
        CREATE TABLE course_videos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            video_url TEXT NOT NULL,
            duration TEXT, -- e.g., "15:30", "1:23:45"
            order_index INTEGER DEFAULT 0,
            thumbnail_url TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created course_videos table';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_package_courses_package ON package_courses(package_id);
CREATE INDEX IF NOT EXISTS idx_package_courses_course ON package_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_course_videos_course ON course_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_course_videos_order ON course_videos(course_id, order_index);

-- Row Level Security Policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos ENABLE ROW LEVEL SECURITY;

-- Public read access to active courses
DROP POLICY IF EXISTS "Anyone can view active courses" ON courses;
CREATE POLICY "Anyone can view active courses" ON courses
    FOR SELECT USING (is_active = true);

-- Public read access to package-course relationships
DROP POLICY IF EXISTS "Anyone can view package courses" ON package_courses;
CREATE POLICY "Anyone can view package courses" ON package_courses
    FOR SELECT USING (true);

-- Public read access to active course videos
DROP POLICY IF EXISTS "Anyone can view active course videos" ON course_videos;
CREATE POLICY "Anyone can view active course videos" ON course_videos
    FOR SELECT USING (is_active = true);

-- Add triggers for updated_at (only if function exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
        CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_course_videos_updated_at ON course_videos;
        CREATE TRIGGER update_course_videos_updated_at BEFORE UPDATE ON course_videos
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'Created update triggers for courses tables';
    END IF;
END $$;

-- Insert sample courses (optional - for testing)
INSERT INTO courses (title, description, duration, is_active) VALUES
('Introduction to Digital Marketing', 'Learn the basics of digital marketing and online advertising', '2 hours 30 minutes', true),
('Advanced SEO Techniques', 'Master search engine optimization for better website rankings', '3 hours 15 minutes', true),
('Social Media Strategy', 'Create effective social media campaigns that drive engagement', '1 hour 45 minutes', true),
('Email Marketing Mastery', 'Build successful email campaigns that convert subscribers', '2 hours', true),
('Content Creation Fundamentals', 'Learn to create compelling content for digital platforms', '4 hours', true),
('Analytics and Data Analysis', 'Understand web analytics and make data-driven decisions', '2 hours 45 minutes', true)
ON CONFLICT DO NOTHING;

-- Link sample courses to packages (if packages exist)
DO $$
DECLARE
    starter_package_id UUID;
    elite_package_id UUID;
    warriors_package_id UUID;
    course_ids UUID[];
BEGIN
    -- Get package IDs
    SELECT id INTO starter_package_id FROM packages WHERE title = 'Pargati Starter' LIMIT 1;
    SELECT id INTO elite_package_id FROM packages WHERE title = 'Pargati Elite' LIMIT 1;
    SELECT id INTO warriors_package_id FROM packages WHERE title = 'Pargati Warriors' LIMIT 1;
    
    -- Get course IDs
    SELECT ARRAY(SELECT id FROM courses ORDER BY created_at LIMIT 6) INTO course_ids;
    
    -- Link courses to packages
    IF starter_package_id IS NOT NULL AND array_length(course_ids, 1) >= 2 THEN
        INSERT INTO package_courses (package_id, course_id, order_index) VALUES
        (starter_package_id, course_ids[1], 1),
        (starter_package_id, course_ids[2], 2)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF elite_package_id IS NOT NULL AND array_length(course_ids, 1) >= 4 THEN
        INSERT INTO package_courses (package_id, course_id, order_index) VALUES
        (elite_package_id, course_ids[1], 1),
        (elite_package_id, course_ids[2], 2),
        (elite_package_id, course_ids[3], 3),
        (elite_package_id, course_ids[4], 4)
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF warriors_package_id IS NOT NULL AND array_length(course_ids, 1) >= 6 THEN
        INSERT INTO package_courses (package_id, course_id, order_index) VALUES
        (warriors_package_id, course_ids[1], 1),
        (warriors_package_id, course_ids[2], 2),
        (warriors_package_id, course_ids[3], 3),
        (warriors_package_id, course_ids[4], 4),
        (warriors_package_id, course_ids[5], 5),
        (warriors_package_id, course_ids[6], 6)
        ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Linked courses to packages';
END $$;

-- Verification queries (uncomment to check results)
-- SELECT 'Courses' as table_name, COUNT(*) as count FROM courses
-- UNION ALL
-- SELECT 'Package Courses' as table_name, COUNT(*) as count FROM package_courses
-- UNION ALL  
-- SELECT 'Course Videos' as table_name, COUNT(*) as count FROM course_videos;