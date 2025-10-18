-- Update the process_referral_commission function to use fixed commission amounts
-- instead of percentage-based commission rates

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