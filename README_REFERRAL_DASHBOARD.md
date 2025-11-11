# YouthPargati Referral Dashboard System

## Overview

This document describes the implementation of the dynamic referral system for the YouthPargati e-learning platform. The system allows users to generate and share unique referral codes for each course package they have purchased or have access to.

## Features Implemented

### 1. Unique Referral Code Generation
- Each course/package has a unique referral code generated automatically using:
  - UserName (first 6 characters)
  - CourseName (first 10 characters, spaces replaced with underscores)
  - Random 4-digit number
- Example: `SHABAN-PARGATI_ELITE-4729`

### 2. Dashboard Layout
- **Section 1: "Your Purchased Packages"**
  - Displays all purchased packages (fetched from database)
  - Shows: Package Name, Referral Code (auto-generated)
  - Includes "Copy" and "Share" buttons for WhatsApp

- **Section 2: "Other Packages"**
  - Shows all packages the user has NOT purchased yet
  - Auto-generates referral codes for these packages as well
  - Displays message: "These are referral codes for packages you haven't purchased yet."
  - Automatically moves packages from this section to "Your Purchased Packages" when user buys them

### 3. Functionality
- Referral codes are stored and retrieved from the user's record in Firebase
- When a new user buys a package using a referral code, the system stores who referred them
- When user buys a package, that package automatically moves from "Other Packages" → "Your Purchased Packages"
- Referral commissions are calculated based on whether the referrer has purchased the same package:
  - Owned Commission: Higher commission for referrers who have purchased the same package
  - Unowned Commission: Lower commission for referrers who haven't purchased the same package

### 4. UI Components
- Clean card-based layout for each course using Tailwind CSS
- "Copy Code" and "Share" buttons for each package
- Clear separation between "Your Purchased Packages" and "Other Packages" sections
- Loading animation while fetching data

## Data Structure

### Students Collection
The student document structure has been updated to include referral codes:

```javascript
/students/{uid}
{
  uid: string,
  name: string,
  email: string,
  referral_codes: {
    "packageId_code": "USERNAME-PACKAGENAME-1234",
    // ... more package codes
  },
  purchased_package: string,
  referred_by: string,
  referrer_uid: string,
  wallet_balance: number,
  total_earned: number
}
```

### Purchases Collection
The purchase record structure has been updated to track referral information:

```javascript
/purchases/{purchaseId}
{
  student_uid: string,
  package_id: string,
  referred_by: string,
  referrer_uid: string,
  commission: number,
  commission_type: string, // "owned" or "unowned"
  purchase_date: timestamp,
  payment_status: string
}
```

## Implementation Details

### Components
1. **ReferralDashboard.jsx** - Main dashboard component showing purchased and other packages
2. **Login.jsx** - Updated to initialize referral_codes field for new users
3. **PaymentSuccess.jsx** - Updated to store referrer information and process commissions when a purchase is made with a referral code
4. **StudentDashboard.jsx** - Updated to display referral earnings based on commission_type
5. **Home.jsx** - Added link to referral dashboard for logged-in users
6. **PackageCourses.jsx** - Added link to referral dashboard

### Routes
- `/referral-dashboard` - Access the referral dashboard

### Real-time Updates
The dashboard uses Firebase real-time listeners to automatically update when:
- A user purchases a new package
- User data changes
- Wallet balance and earnings are updated

## Usage Instructions

1. **Accessing the Referral Dashboard**
   - Log in to the platform
   - From the home page, click "My Referral Dashboard"
   - Or from the student dashboard, click "Referral Dashboard"
   - Or navigate directly to `/referral-dashboard`

2. **Using Referral Codes**
   - Copy referral codes from either section using the "Copy" button
   - Share referral codes using the "Share" button (opens WhatsApp)
   - When someone uses your referral code to purchase a package, you earn commissions based on whether you own that package

3. **Automatic Package Movement**
   - When you purchase a new package, it will automatically appear in "Your Purchased Packages"
   - The same package will be removed from "Other Packages"

## Technical Implementation

### Referral Code Generation Algorithm
```javascript
const generateReferralCode = (userName, packageName) => {
  // Extract first part of username (max 6 characters)
  const userPart = userName.split(' ')[0].substring(0, 6).toUpperCase();
  
  // Extract first part of package name (max 10 characters)
  const packagePart = packageName.replace(/\s+/g, '_').substring(0, 10).toUpperCase();
  
  // Generate random 4-digit number
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  
  return `${userPart}-${packagePart}-${randomNumber}`;
};
```

### Commission System
The referral system now supports two types of commissions:

| Package Level | Owned Commission (referrer has package) | Unowned Commission (referrer doesn't have package) |
|---------------|-----------------------------------------|---------------------------------------------------|
| Seed          | ₹80                                     | ₹40                                               |
| Basic         | ₹150                                    | ₹75                                               |
| Elite         | ₹200                                    | ₹100                                              |
| Warriors      | ₹300                                    | ₹150                                              |

### Firebase Structure Updates
1. Added `referral_codes` object to student documents
2. Added `referrer_uid` field to student documents
3. Added `referrer_uid` and `commission_type` fields to purchase records
4. Added `wallet_balance` and `total_earned` fields to student documents

## Future Enhancements

1. **Multi-platform Sharing**
   - Add sharing options for Telegram, Instagram, and other social platforms
   - Implement deep linking for mobile app referrals

2. **Referral Analytics**
   - Track how many people used each referral code
   - Show conversion rates for each package

3. **Enhanced UI/UX**
   - Add QR codes for referral codes
   - Implement copy notifications with toast messages
   - Add sorting and filtering options

4. **Advanced Referral Features**
   - Multi-level referral system
   - Referral bonuses and rewards
   - Referral leaderboards

## Testing

To test the referral system:
1. Create a new user account
2. Navigate to the referral dashboard
3. Verify that referral codes are generated for all packages
4. Purchase a package and verify it moves to "Your Purchased Packages"
5. Use a referral code when purchasing a package as another user
6. Verify that the referrer information is stored correctly
7. Check that the referrer earns the correct commission based on whether they own the package
8. Verify that the commission is displayed correctly in the student dashboard