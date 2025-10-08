-- Additional Database Schema for Course Management System
-- Run these SQL commands in your Supabase SQL Editor

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT, -- e.g., "2 hours", "45 minutes"
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package-Course relationship table (many-to-many)
CREATE TABLE IF NOT EXISTS package_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(package_id, course_id)
);

-- Course Videos table
CREATE TABLE IF NOT EXISTS course_videos (
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
CREATE POLICY "Anyone can view active courses" ON courses
    FOR SELECT USING (is_active = true);

-- Public read access to package-course relationships
CREATE POLICY "Anyone can view package courses" ON package_courses
    FOR SELECT USING (true);

-- Public read access to active course videos
CREATE POLICY "Anyone can view active course videos" ON course_videos
    FOR SELECT USING (is_active = true);

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_videos_updated_at BEFORE UPDATE ON course_videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample Data (Optional - for testing)
-- Insert sample courses
INSERT INTO courses (title, description, duration, is_active) VALUES
('Introduction to Digital Marketing', 'Learn the basics of digital marketing and online advertising', '2 hours 30 minutes', true),
('Advanced SEO Techniques', 'Master search engine optimization for better website rankings', '3 hours 15 minutes', true),
('Social Media Strategy', 'Create effective social media campaigns that drive engagement', '1 hour 45 minutes', true),
('Email Marketing Mastery', 'Build successful email campaigns that convert subscribers', '2 hours', true),
('Content Creation Fundamentals', 'Learn to create compelling content for digital platforms', '4 hours', true),
('Analytics and Data Analysis', 'Understand web analytics and make data-driven decisions', '2 hours 45 minutes', true)
ON CONFLICT DO NOTHING;

-- Link courses to packages (assuming package IDs exist)
-- You'll need to replace these with actual package IDs from your packages table
-- Example:
-- INSERT INTO package_courses (package_id, course_id, order_index) 
-- SELECT p.id, c.id, 1 FROM packages p, courses c 
-- WHERE p.title = 'Pargati Starter' AND c.title = 'Introduction to Digital Marketing';

-- Sample course videos (you'll need to add actual video URLs)
-- INSERT INTO course_videos (course_id, title, description, video_url, duration, order_index) VALUES
-- (
--     (SELECT id FROM courses WHERE title = 'Introduction to Digital Marketing' LIMIT 1),
--     'Getting Started with Digital Marketing',
--     'An overview of digital marketing concepts and strategies',
--     'https://your-video-hosting.com/video1.mp4',
--     '15:30',
--     1
-- );