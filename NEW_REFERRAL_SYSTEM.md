# New Referral System Implementation

## Overview
This document describes the new referral system implemented for YouthPargati, which provides package-specific referral codes and dynamic commission calculation based on package rates.

## Key Features

### 1. Package-Specific Referral Codes
- Each student receives unique referral codes for each package they purchase
- Referral codes are generated using the format: `{USERNAME}{PACKAGENAME}{RANDOM}`
- Example: "JOHPAR123" for a user named "John" referring the "Pargati" package

### 2. Dynamic Commission Calculation
- Commission rates are fetched from the `packages` table
- No longer using static 10% commission
- Each package can have its own commission rate

### 3. Referral Code Entry Options
- Users can enter referral codes via URL parameters (`?ref=CODE`)
- Users can manually enter referral codes during checkout
- Both methods are supported for flexibility

### 4. Dashboard Improvements
- Shows only referral codes for packages the user has purchased
- Displays "Buy this package to unlock referral" message for unpurchased packages
- Shows total referral earnings

## Database Schema Changes

### New Table: `user_referral_codes`
Stores package-specific referral codes for each user:
- `id`: UUID primary key
- `user_id`: References students table
- `package_id`: References packages table
- `referral_code`: Unique referral code
- `referral_link`: Full referral link
- `created_at`: Timestamp

### Modified Table: `purchases`
Added new column:
- `referral_code`: Stores the referral code used for this purchase

### New Database Functions
1. `generate_package_referral_code(username, package_name)`: Generates package-specific referral codes
2. `process_referral_commission()`: Handles commission calculation and referral tracking
3. `generate_user_referral_code_on_purchase()`: Automatically generates referral codes when a user purchases a package

### New Triggers
1. `process_referral_commission_before_purchase`: Processes referral commissions before inserting a purchase
2. `generate_referral_code_after_purchase`: Generates referral codes after a purchase is made

## Implementation Details

### Registration Flow
1. Captures referral codes from URL parameters (`?ref=CODE`)
2. Allows manual entry of referral codes during registration
3. Tracks referral relationships in the `referrals` table

### Purchase Flow
1. Users can enter referral codes during checkout
2. Commission is calculated based on the package's commission rate
3. Referral codes are validated against the `user_referral_codes` table
4. Commissions are credited to the referrer's affiliate account

### Dashboard Display
1. Shows package-specific referral codes only for purchased packages
2. Displays total referral earnings from the `affiliates` table
3. Provides copy functionality for referral links

## Migration Steps

1. Run `add-referral-code-to-purchases.sql` to add the referral_code column to the purchases table
2. Run the updated `database-schema.sql` to create the new table and functions
3. Deploy the updated frontend code

## API Changes

### New Functions in `src/lib/api.js`
- `getUserReferralCodes(userId)`: Fetches referral codes for a user's purchased packages
- `generateUserReferralCodes(userId)`: Generates referral codes for all purchased packages

### Modified Functions
- `createStudent()`: Now accepts and processes referral codes during registration
- `handlePackagePayment()`: Now accepts referral codes during checkout

## Frontend Changes

### New Components
- Referral code input fields on Home and PackageCourses pages
- Package-specific referral code display on Student Dashboard

### Modified Components
- Registration page now captures referral codes from URL and manual input
- Payment processing now passes referral codes to the backend
- Dashboard now shows package-specific referral information

## Testing

To test the new referral system:

1. Register a new user (without referral code)
2. Purchase a package
3. Verify that a package-specific referral code is generated
4. Register another user using the referral code
5. Verify that the referrer's commission is updated
6. Check that the referral appears in the referrals table

## Future Improvements

1. Add expiration dates for referral codes
2. Implement referral code usage limits
3. Add referral program analytics
4. Create referral leaderboards