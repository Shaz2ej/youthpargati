# YouthPargati Referral System Implementation

## Overview

This document describes the implementation of the fixed self-package-based referral commission system for the YouthPargati e-learning website.

## System Architecture

### Key Components

1. **PaymentSuccess.jsx** - Handles purchase record creation and referral commission processing
2. **StudentDashboard.jsx** - Displays wallet balance, earnings, and referral information
3. **packageCommissions.js** - Contains commission mapping for each package level
4. **Firestore Collections**:
   - `/students` - Student data including referral codes and wallet balances
   - `/packages` - Package information including prices
   - `/purchases` - Purchase records with referral information

### Commission Structure

| Package Level | Commission Earned by Referrer |
|---------------|-------------------------------|
| Seed          | ₹80                           |
| Basic         | ₹150                          |
| Elite         | ₹200                          |
| Warriors      | ₹300                          |

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
   - The referrer earns the fixed commission amount based on their own package level
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

### Package Commission Mapping

The commission amounts are defined in `src/lib/packageCommissions.js`:

```javascript
export const packageCommissions = {
  'seed': 80,
  'basic': 150,
  'elite': 200,
  'warriors': 300
};
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
  commission: number
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
  purchase_date: timestamp,
  payment_status: string
}
```

## Example Scenarios

### Scenario 1: Seed Package Referrer
- Referrer: Shaban (purchased Seed package)
- Buyer: New student (purchases any package)
- Result: Shaban earns ₹80 commission

### Scenario 2: Warriors Package Referrer
- Referrer: Shaban (purchased Warriors package)
- Buyer: New student (purchases any package)
- Result: Shaban earns ₹300 commission

## Future Improvements

1. **Admin Dashboard**: Create an admin interface to manage commissions and view withdrawal requests
2. **Email Notifications**: Send email notifications for successful withdrawals
3. **Referral Tracking**: Add more detailed tracking of referral performance
4. **Multi-level Referrals**: Implement multi-level referral commissions

## Testing

To test the referral system:

1. Create two test accounts
2. Have one account purchase a package to generate a referral code
3. Have the second account make a purchase using the first account's referral code
4. Verify that the correct commission amount is added to the first account's wallet

## Troubleshooting

### Common Issues

1. **Commission Not Credited**: Check that the referrer's purchased_package field is correctly set in Firestore
2. **Referral Code Not Found**: Verify the referral code matches exactly (case-sensitive)
3. **Withdrawal Not Processing**: Check Firestore permissions for the withdraw_requests collection

### Debugging Tips

1. Check browser console for JavaScript errors
2. Verify Firestore rules allow read/write operations
3. Ensure package IDs in Firestore match the commission mapping