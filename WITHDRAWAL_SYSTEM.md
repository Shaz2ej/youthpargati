# Withdrawal System Implementation

## Overview
This document describes the new withdrawal system implemented for YouthPargati, which provides enhanced functionality for students to withdraw their earnings with UPI ID management and improved validation.

## Key Features

### 1. UPI ID Management
- Students can enter and save their UPI ID for withdrawals
- UPI ID is stored in the `students` table in the `upi_id` column
- Students can edit their UPI ID at any time from the dashboard
- Modal interface for first-time UPI ID entry

### 2. Enhanced Withdrawal Validation
- Minimum withdrawal amount set to ₹200
- Prevention of duplicate withdrawal requests while one is pending
- Real-time validation of withdrawal amounts

### 3. Improved Withdrawal History
- Detailed withdrawal history table showing:
  - Date of request
  - Amount requested
  - UPI ID used
  - Status (pending, processing, completed, failed, cancelled)
  - Admin notes (if any)
  - Processing date (when approved)

### 4. User Experience Improvements
- Clear error messaging for validation failures
- Modal interface for UPI ID management
- Visual feedback during processing
- Comprehensive withdrawal history display

## Database Schema Changes

### Modified Table: `students`
Added new column:
- `upi_id`: TEXT - Stores the student's UPI ID

### Modified Table: `withdrawals`
Enhanced usage of existing columns:
- `bank_details`: JSONB - Now stores UPI ID in the format `{"upi_id": "example@upi"}`
- `admin_notes`: TEXT - For admin comments on withdrawal requests
- `processed_date`: TIMESTAMP - When the withdrawal was processed

## API Changes

### New Functions in `src/lib/api.js`
- `updateStudentUpiId(userId, upiId)`: Updates a student's UPI ID
- Modified `requestWithdrawal(userId, amount, upiId)`: 
  - Added UPI ID parameter
  - Added minimum amount validation (₹200)
  - Added duplicate request prevention
  - Stores UPI ID with withdrawal request

### Modified Functions
- `getStudentData(userId)`: Now includes UPI ID in returned data

## Frontend Changes

### New Components
- UPI ID modal for first-time entry and editing
- Enhanced withdrawal history display with detailed information

### Modified Components
- `WithdrawalsCard`: Completely redesigned to support new features
- `StudentDashboard`: Updated to pass student data to WithdrawalsCard

## Implementation Details

### UPI ID Workflow
1. When a student visits the dashboard without a saved UPI ID, a modal prompts them to enter one
2. Students can edit their UPI ID at any time using the edit button
3. UPI ID is saved to the `students` table
4. UPI ID is associated with each withdrawal request

### Withdrawal Process
1. Students enter withdrawal amount (minimum ₹200)
2. System checks for existing pending withdrawals
3. If UPI ID exists, it's automatically associated with the request
4. Withdrawal request is created with status 'pending'
5. Admin can approve/reject from the admin panel
6. Upon approval, status changes to 'completed' and `processed_date` is set

### Validation Rules
1. Minimum withdrawal amount: ₹200
2. Cannot submit new withdrawal while one is pending
3. UPI ID required for first withdrawal
4. Amount cannot exceed available balance

## Migration Steps

1. Run `add-upi-id-to-students.sql` to add the upi_id column to the students table
2. Deploy the updated frontend code
3. Test the new withdrawal functionality

## Admin Panel Considerations

The admin panel should be updated to:
1. View and manage withdrawal requests
2. Approve/reject withdrawals
3. Add admin notes to withdrawal requests
4. Set processed_date when approving withdrawals

## Testing

To test the new withdrawal system:

1. Register a new student account
2. Verify UPI ID modal appears on first dashboard visit
3. Enter and save a UPI ID
4. Ensure UPI ID is displayed and editable
5. Attempt withdrawal below ₹200 (should fail)
6. Attempt withdrawal above ₹200 (should succeed)
7. Attempt second withdrawal while first is pending (should fail)
8. Check withdrawal history for proper display of information

## Future Improvements

1. Add UPI ID validation format checking
2. Implement withdrawal limits per time period
3. Add email/SMS notifications for withdrawal status changes
4. Create withdrawal analytics for admin dashboard