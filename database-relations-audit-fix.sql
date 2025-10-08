-- Database Relations Audit and Fix
-- Run this in your Supabase SQL Editor

-- First, let's verify current schema and relationships
DO $$
BEGIN
    RAISE NOTICE '=== DATABASE RELATIONS AUDIT ===';
    
    -- Check if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'packages') THEN
        RAISE NOTICE '✅ packages table exists';
    ELSE
        RAISE NOTICE '❌ packages table missing';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
        RAISE NOTICE '✅ courses table exists';
    ELSE
        RAISE NOTICE '❌ courses table missing';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'package_courses') THEN
        RAISE NOTICE '✅ package_courses table exists';
    ELSE
        RAISE NOTICE '❌ package_courses table missing';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_videos') THEN
        RAISE NOTICE '✅ course_videos table exists';
    ELSE
        RAISE NOTICE '❌ course_videos table missing';
    END IF;
END $$;

-- Create missing tables with proper foreign key constraints
DO $$
BEGIN
    -- Ensure packages table exists (should already exist)
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'packages') THEN
        CREATE TABLE packages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            thumbnail_url TEXT,
            commission_rate DECIMAL(5,2) DEFAULT 10.00,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created packages table';
    END IF;

    -- Create courses table (standalone - no direct package_id)
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
        CREATE TABLE courses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            duration TEXT,
            thumbnail_url TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created courses table';
    END IF;

    -- Create package_courses relationship table (many-to-many)
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'package_courses') THEN
        CREATE TABLE package_courses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
            course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            order_index INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(package_id, course_id)
        );
        RAISE NOTICE 'Created package_courses table';
    END IF;

    -- Create course_videos table with proper course_id foreign key
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_videos') THEN
        CREATE TABLE course_videos (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT,
            video_embed TEXT NOT NULL, -- Changed from video_url to video_embed
            duration TEXT,
            order_index INTEGER DEFAULT 0,
            thumbnail_url TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created course_videos table';
    ELSE
        -- Update existing table to use video_embed column
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'course_videos' AND column_name = 'video_url') 
           AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'course_videos' AND column_name = 'video_embed') THEN
            ALTER TABLE course_videos RENAME COLUMN video_url TO video_embed;
            RAISE NOTICE 'Renamed video_url to video_embed in course_videos table';
        END IF;
    END IF;
END $$;

-- Create proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_packages_active ON packages(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_package_courses_package ON package_courses(package_id);
CREATE INDEX IF NOT EXISTS idx_package_courses_course ON package_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_course_videos_course ON course_videos(course_id);
CREATE INDEX IF NOT EXISTS idx_course_videos_order ON course_videos(course_id, order_index);

-- Set up Row Level Security
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
DROP POLICY IF EXISTS "Anyone can view active packages" ON packages;
CREATE POLICY "Anyone can view active packages" ON packages
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view active courses" ON courses;
CREATE POLICY "Anyone can view active courses" ON courses
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view package courses" ON package_courses;
CREATE POLICY "Anyone can view package courses" ON package_courses
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view active course videos" ON course_videos;
CREATE POLICY "Anyone can view active course videos" ON course_videos
    FOR SELECT USING (is_active = true);

-- Verify and display current relationships
DO $$
DECLARE
    package_count INTEGER;
    course_count INTEGER;
    package_course_count INTEGER;
    video_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO package_count FROM packages WHERE is_active = true;
    SELECT COUNT(*) INTO course_count FROM courses WHERE is_active = true;
    SELECT COUNT(*) INTO package_course_count FROM package_courses;
    SELECT COUNT(*) INTO video_count FROM course_videos WHERE is_active = true;
    
    RAISE NOTICE '=== CURRENT DATA SUMMARY ===';
    RAISE NOTICE 'Active Packages: %', package_count;
    RAISE NOTICE 'Active Courses: %', course_count;
    RAISE NOTICE 'Package-Course Links: %', package_course_count;
    RAISE NOTICE 'Active Videos: %', video_count;
    
    IF package_course_count = 0 AND package_count > 0 AND course_count > 0 THEN
        RAISE NOTICE '⚠️  No package-course relationships exist!';
        RAISE NOTICE '   This means videos will appear in all packages instead of being filtered.';
        RAISE NOTICE '   Run the relationship setup below to fix this.';
    END IF;
END $$;

-- Add sample data and relationships if none exist
INSERT INTO packages (title, description, price, is_active) VALUES
('Pargati Starter', 'Basic digital marketing package for beginners', 299.00, true),
('Pargati Elite', 'Comprehensive digital marketing training for professionals', 599.00, true),
('Pargati Warriors', 'Advanced masterclass for digital marketing experts', 999.00, true)
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, description, duration, is_active) VALUES
('Introduction to Digital Marketing', 'Learn the basics of digital marketing and online advertising', '2 hours 30 minutes', true),
('Advanced SEO Techniques', 'Master search engine optimization for better website rankings', '3 hours 15 minutes', true),
('Social Media Strategy', 'Create effective social media campaigns that drive engagement', '1 hour 45 minutes', true),
('Email Marketing Mastery', 'Build successful email campaigns that convert subscribers', '2 hours', true),
('Content Creation Fundamentals', 'Learn to create compelling content for digital platforms', '4 hours', true),
('Analytics and Data Analysis', 'Understand web analytics and make data-driven decisions', '2 hours 45 minutes', true)
ON CONFLICT DO NOTHING;

-- Create proper package-course relationships
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
    
    -- Only proceed if we have the required data
    IF starter_package_id IS NOT NULL AND array_length(course_ids, 1) >= 6 THEN
        -- Clear existing relationships to avoid duplicates
        DELETE FROM package_courses;
        
        -- Starter Package: 2 courses
        INSERT INTO package_courses (package_id, course_id, order_index) VALUES
        (starter_package_id, course_ids[1], 1),
        (starter_package_id, course_ids[2], 2);
        
        -- Elite Package: 4 courses
        INSERT INTO package_courses (package_id, course_id, order_index) VALUES
        (elite_package_id, course_ids[1], 1),
        (elite_package_id, course_ids[2], 2),
        (elite_package_id, course_ids[3], 3),
        (elite_package_id, course_ids[4], 4);
        
        -- Warriors Package: All 6 courses
        INSERT INTO package_courses (package_id, course_id, order_index) VALUES
        (warriors_package_id, course_ids[1], 1),
        (warriors_package_id, course_ids[2], 2),
        (warriors_package_id, course_ids[3], 3),
        (warriors_package_id, course_ids[4], 4),
        (warriors_package_id, course_ids[5], 5),
        (warriors_package_id, course_ids[6], 6);
        
        RAISE NOTICE '✅ Created proper package-course relationships';
        RAISE NOTICE '   - Starter: 2 courses';
        RAISE NOTICE '   - Elite: 4 courses';  
        RAISE NOTICE '   - Warriors: 6 courses';
    ELSE
        RAISE NOTICE '⚠️  Could not create relationships - missing packages or courses';
    END IF;
END $$;

-- Final verification
SELECT 
    p.title as package_name,
    COUNT(pc.course_id) as course_count,
    STRING_AGG(c.title, ', ' ORDER BY pc.order_index) as courses
FROM packages p
LEFT JOIN package_courses pc ON p.id = pc.package_id
LEFT JOIN courses c ON pc.course_id = c.id
WHERE p.is_active = true
GROUP BY p.id, p.title
ORDER BY p.title;