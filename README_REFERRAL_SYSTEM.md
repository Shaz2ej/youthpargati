# YouthPargati Referral System Implementation

## Overview

This document describes the implementation of the fixed self-package-based referral commission system for the YouthPargati e-learning website.

## System Architecture

### Key Components

1. **PaymentSuccess.jsx** - Handles purchase record creation and referral commission processing
2. **StudentDashboard.jsx** - Displays wallet balance, earnings, and referral information
3. **Firestore Collections**:
   - `/students` - Student data including referral codes and wallet balances
   - `/packages` - Package information including prices and commission amounts
   - `/purchases` - Purchase records with referral information

### Commission Structure

The referral system now supports two types of commissions based on whether the referrer has purchased the same package:

| Package Level | Owned Commission (referrer has package) | Unowned Commission (referrer doesn't have package) |
|---------------|-----------------------------------------|---------------------------------------------------|
| Seed          | ₹80                                     | ₹40                                               |
| Basic         | ₹150                                    | ₹75                                               |
| Elite         | ₹200                                    | ₹100                                              |
| Warriors      | ₹300                                    | ₹150                                              |

## How It Works

### 1. Purchase Flow

When a user makes a purchase:
1. They may optionally enter a referral code
2. After successful payment, the system:
   - Creates a purchase record in Firestore
   - Updates the buyer's student document with their purchased package
   - Processes referral commissions if a valid referral code was provided

### 2. Referral Commission Logic

The fixed self-package-based referral system works as follows:
1. When a purchase is made with a referral code:
   - The system finds the student with that referral code
   - It checks what package that referrer has purchased
   - If the referrer has purchased the same package, they earn the "owned" commission
   - If the referrer has not purchased the same package, they earn the "unowned" commission
   - The system fetches the commission amount dynamically from Firestore based on the referrer's package
   - The commission is added to their wallet balance and total earnings

**Important**: The commission amount is based on the referrer's package level, NOT the buyer's package level.

### 3. Wallet Dashboard

The student dashboard displays:
- Day 1 Earnings
- Day 10 Earnings
- Day 20 Earnings
- Day 30 Earnings
- Wallet Balance
- Total Earned
- Referral Code
- Withdrawal Option (for balances ≥ ₹200)

### 4. Withdrawal System

Students can withdraw their earnings when their wallet balance reaches ₹200 or more:
1. Click "Withdraw Earnings" button
2. Choose between UPI or Bank Account withdrawal
3. Enter required payment details
4. Submit withdrawal request
5. Wallet balance is reset to 0 after successful request

## Implementation Details

### Package Commission Fetching

Commission amounts are now fetched dynamically from Firestore instead of using hardcoded frontend values. The system uses the `fetchPackageCommission` and `fetchPackageCommissionUnowned` functions from `src/lib/utils.js` to retrieve commission amounts.

```javascript
// In PaymentSuccess.jsx
const referrerCommission = await fetchPackageCommission(packageId); // for owned
const referrerCommission = await fetchPackageCommissionUnowned(packageId); // for unowned
```

### Firestore Data Structure

#### Students Collection
```
/students/{uid}
{
  uid: string,
  name: string,
  email: string,
  mobile_number: string,
  state: string,
  referral_code: string,
  referred_by: string,
  wallet_balance: number,
  total_earned: number,
  purchased_package: string,
  day1_earning: number,
  day10_earning: number,
  day20_earning: number,
  day30_earning: number
}
```

#### Packages Collection
```
/packages/{packageId}
{
  id: string,
  name: string,
  title: string,
  description: string,
  price: number,
  commission: number,        // for users who have purchased the package
  commission_unowned: number // for users who haven't purchased the package
}
```

#### Purchases Collection
```
/purchases/{purchaseId}
{
  student_uid: string,
  package_id: string,
  referred_by: string,
  commission: number,
  commission_type: string, // "owned" or "unowned"
  purchase_date: timestamp,
  payment_status: string
}
```

## Example Scenarios

### Scenario 1: Seed Package Referrer (Owned)
- Referrer: Shaban (purchased Seed package)
- Buyer: New student (purchases Seed package)
- Result: Shaban earns ₹80 commission

### Scenario 2: Seed Package Referrer (Unowned)
- Referrer: Shaban (has not purchased Seed package)
- Buyer: New student (purchases Seed package)
- Result: Shaban earns ₹40 commission

### Scenario 3: Warriors Package Referrer (Owned)
- Referrer: Shaban (purchased Warriors package)
- Buyer: New student (purchases any package)
- Result: Shaban earns ₹300 commission

### Scenario 4: Warriors Package Referrer (Unowned)
- Referrer: Shaban (has not purchased Warriors package)
- Buyer: New student (purchases Warriors package)
- Result: Shaban earns ₹150 commission

## Testing Instructions

To test the referral system:
1. Create a new user account
2. Purchase a package as the new user
3. Verify that the purchase record is created in Firestore
4. Create another user account
5. Purchase a package using the first user's referral code
6. Verify that the first user's wallet balance is updated with the correct commission
7. Check that the commission amount is fetched from Firestore, not hardcoded

### Debugging Tips

1. Check browser console for JavaScript errors
2. Verify Firestore rules allow read/write operations
3. Ensure package IDs in Firestore match the commission mapping