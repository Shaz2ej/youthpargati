-- Update the process_referral_commission function to calculate commission based on referrer's package
-- instead of the purchased package

CREATE OR REPLACE FUNCTION process_referral_commission()
RETURNS TRIGGER AS $$
DECLARE
    referrer_id UUID;
    referrer_package_id UUID;
    commission_rate DECIMAL(5,2);
    commission_earned DECIMAL(10,2);
BEGIN
    -- Check if a referral code was provided with the purchase
    IF NEW.referral_code IS NOT NULL THEN
        -- Find the referrer using the referral code (package ID no longer needs to match)
        SELECT urc.user_id, urc.package_id INTO referrer_id, referrer_package_id
        FROM user_referral_codes urc
        WHERE urc.referral_code = NEW.referral_code
        LIMIT 1;
        
        -- If referrer found, calculate commission based on referrer's package
        IF referrer_id IS NOT NULL AND referrer_package_id IS NOT NULL THEN
            -- Get commission rate for the referrer's package (not the purchased package)
            SELECT commission_rate INTO commission_rate
            FROM packages
            WHERE id = referrer_package_id;
            
            -- Calculate commission based on referrer's package commission rate
            IF commission_rate IS NOT NULL THEN
                commission_earned := (NEW.amount * commission_rate / 100);
            ELSE
                commission_earned := 0;
            END IF;
            
            -- Update the purchase with the calculated commission
            NEW.commission_earned := commission_earned;
            
            -- Create referral record
            INSERT INTO referrals (referrer_id, referred_id, referral_code, commission_earned)
            VALUES (referrer_id, NEW.student_id, NEW.referral_code, commission_earned);
            
            -- Update referrer's affiliate record
            UPDATE affiliates 
            SET total_commission = total_commission + commission_earned,
                total_referrals = total_referrals + 1,
                updated_at = NOW()
            WHERE student_id = referrer_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;