-- Supabase Database Schema for YouthPargati Student Dashboard
-- Run these SQL commands in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_auth_uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    upi_id TEXT, -- New column for UPI ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    commission_rate DECIMAL(5,2) DEFAULT 10.00, -- 10% commission
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id),
    package_name TEXT NOT NULL, -- Denormalized for performance
    amount DECIMAL(10,2) NOT NULL,
    commission_earned DECIMAL(10,2) NOT NULL,
    referral_code TEXT, -- New column for referral code
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_method TEXT,
    bank_details JSONB, -- Store bank account details securely
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    total_leads INTEGER DEFAULT 0,
    total_commission DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table (to track who referred whom)
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES students(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES students(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    commission_earned DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Referral Codes table (package-specific referral codes)
CREATE TABLE IF NOT EXISTS user_referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES students(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    referral_link TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_supabase_auth_uid ON students(supabase_auth_uid);
CREATE INDEX IF NOT EXISTS idx_students_referral_code ON students(referral_code);
CREATE INDEX IF NOT EXISTS idx_purchases_student_id ON purchases(student_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_withdrawals_student_id ON withdrawals(student_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_affiliates_student_id ON affiliates(student_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_codes_user_id ON user_referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_codes_package_id ON user_referral_codes(package_id);
CREATE INDEX IF NOT EXISTS idx_user_referral_codes_referral_code ON user_referral_codes(referral_code);

-- Row Level Security (RLS) Policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Students can only see their own data
CREATE POLICY "Students can view own data" ON students
    FOR SELECT USING (supabase_auth_uid = auth.jwt() ->> 'sub');

CREATE POLICY "Students can update own data" ON students
    FOR UPDATE USING (supabase_auth_uid = auth.jwt() ->> 'sub');

-- Purchases policies
CREATE POLICY "Students can view own purchases" ON purchases
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );

-- Simplified and reliable RLS policy for Firebase/Supabase auth integration
DROP POLICY IF EXISTS "Allow students to insert their own purchases" ON purchases;
CREATE POLICY "Allow students to insert their own purchases" ON purchases
FOR INSERT WITH CHECK (
    -- Directly check if the student_id being inserted exists in the students table
    -- AND is linked to the CURRENT authenticated user's UID
    student_id IN (
        SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
    )
);

-- Withdrawals policies
CREATE POLICY "Students can view own withdrawals" ON withdrawals
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Students can create own withdrawals" ON withdrawals
    FOR INSERT WITH CHECK (
        student_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );

-- Affiliates policies
CREATE POLICY "Students can view own affiliate data" ON affiliates
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );

-- Referrals policies
CREATE POLICY "Students can view own referrals" ON referrals
    FOR SELECT USING (
        referrer_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );

-- User Referral Codes policies
CREATE POLICY "Students can view own referral codes" ON user_referral_codes
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM students WHERE supabase_auth_uid = auth.jwt() ->> 'sub'
        )
    );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON affiliates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(amount DECIMAL, rate DECIMAL DEFAULT 10.00)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (amount * rate / 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update affiliate stats when a purchase is made
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update affiliate commission and leads
    UPDATE affiliates 
    SET total_commission = total_commission + NEW.commission_earned,
        total_leads = total_leads + 1,
        updated_at = NOW()
    WHERE student_id = NEW.student_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update affiliate stats on purchase
CREATE TRIGGER update_affiliate_on_purchase 
    AFTER INSERT ON purchases
    FOR EACH ROW 
    EXECUTE FUNCTION update_affiliate_stats();

-- Insert sample data
INSERT INTO packages (title, price, description, commission_rate) VALUES
('Pargati Starter', 376.00, 'Perfect for beginners entering the digital world', 10.00),
('Pargati Elite', 532.00, 'Advanced skills for serious learners', 10.00),
('Pargati Warriors', 1032.00, 'Elite training for digital champions', 10.00)
ON CONFLICT DO NOTHING;

-- Create a function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 1;
BEGIN
    -- Create base code from name (first 3 letters + random numbers)
    base_code := UPPER(SUBSTRING(REPLACE(name, ' ', ''), 1, 3)) || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    
    -- Check if code exists and generate new one if needed
    WHILE EXISTS (SELECT 1 FROM students WHERE referral_code = base_code) LOOP
        base_code := UPPER(SUBSTRING(REPLACE(name, ' ', ''), 1, 3)) || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    END LOOP;
    
    RETURN base_code;
END;
$$ LANGUAGE plpgsql;

-- Function to increment a value
CREATE OR REPLACE FUNCTION increment(value INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN value + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to generate package-specific referral codes
CREATE OR REPLACE FUNCTION generate_package_referral_code(username TEXT, package_name TEXT)
RETURNS TEXT AS $$
DECLARE
    user_part TEXT;
    package_part TEXT;
    random_num TEXT;
BEGIN
    -- Take first 3 letters of username and package name
    user_part := UPPER(SUBSTRING(REPLACE(username, ' ', ''), 1, 3));
    package_part := UPPER(SUBSTRING(REPLACE(package_name, ' ', ''), 1, 3));
    
    -- Add random numbers
    random_num := LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    
    RETURN user_part || package_part || random_num;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically generate referral codes when a purchase is made
CREATE OR REPLACE FUNCTION generate_user_referral_code_on_purchase()
RETURNS TRIGGER AS $$
DECLARE
    student_name TEXT;
    package_title TEXT;
    referral_code TEXT;
    referral_link TEXT;
BEGIN
    -- Get student name
    SELECT name INTO student_name FROM students WHERE id = NEW.student_id;
    
    -- Get package title
    SELECT title INTO package_title FROM packages WHERE id = NEW.package_id;
    
    -- Generate referral code
    referral_code := generate_package_referral_code(student_name, package_title);
    referral_link := 'https://youthpargati.com/register?ref=' || referral_code;
    
    -- Insert referral code
    INSERT INTO user_referral_codes (user_id, package_id, referral_code, referral_link)
    VALUES (NEW.student_id, NEW.package_id, referral_code, referral_link);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate referral codes when a purchase is made
CREATE TRIGGER generate_referral_code_after_purchase
    AFTER INSERT ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION generate_user_referral_code_on_purchase();

-- Function to handle referral commissions
CREATE OR REPLACE FUNCTION process_referral_commission()
RETURNS TRIGGER AS $$
DECLARE
    referrer_id UUID;
    referrer_package_id UUID;
    fixed_commission DECIMAL(10,2);
BEGIN
    -- Check if a referral code was provided with the purchase
    IF NEW.referral_code IS NOT NULL THEN
        -- Find the referrer using the referral code (package ID no longer needs to match)
        SELECT urc.user_id, urc.package_id INTO referrer_id, referrer_package_id
        FROM user_referral_codes urc
        WHERE urc.referral_code = NEW.referral_code
        LIMIT 1;
        
        -- If referrer found, use fixed commission based on referrer's package
        IF referrer_id IS NOT NULL AND referrer_package_id IS NOT NULL THEN
            -- Get fixed commission amount for the referrer's package
            SELECT commission_amount INTO fixed_commission
            FROM packages
            WHERE id = referrer_package_id;
            
            -- Use fixed commission or default to 0
            IF fixed_commission IS NULL THEN
                fixed_commission := 0;
            END IF;
            
            -- Update the purchase with the fixed commission
            NEW.commission_earned := fixed_commission;
            
            -- Create referral record
            INSERT INTO referrals (referrer_id, referred_id, referral_code, commission_earned)
            VALUES (referrer_id, NEW.student_id, NEW.referral_code, fixed_commission);
            
            -- Update referrer's affiliate record
            UPDATE affiliates 
            SET total_commission = total_commission + fixed_commission,
                total_leads = total_leads + 1,
                updated_at = NOW()
            WHERE student_id = referrer_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to process referral commissions before inserting a purchase
CREATE TRIGGER process_referral_commission_before_purchase
    BEFORE INSERT ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION process_referral_commission();
