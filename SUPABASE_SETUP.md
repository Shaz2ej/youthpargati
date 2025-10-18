# Supabase Setup Guide for YouthPargati Student Dashboard

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Note down your project URL and anon key from Settings > API

## 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql` file
4. Run the SQL script to create all tables, indexes, and policies

## 3. Update Supabase Configuration

Replace the mock client in `src/lib/supabase.js` with real Supabase client:

```javascript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

## 4. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## 5. Authentication Setup

### Option A: Use Firebase Auth (Current Setup)
- Keep your current Firebase authentication
- The dashboard will work with Firebase UID as the student identifier

### Option B: Switch to Supabase Auth
If you want to use Supabase Auth instead:

1. Enable Supabase Auth in your project settings
2. Update the authentication context to use Supabase
3. Update the API functions to use Supabase user ID

## 6. Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 7. Database Tables Created

- **students**: User profiles linked to Firebase UID
- **packages**: Available course packages
- **purchases**: Student purchase history
- **withdrawals**: Withdrawal requests and history
- **affiliates**: Affiliate program data
- **referrals**: Referral tracking

## 8. Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Students can only see their own data
- Students can create withdrawal requests
- Data is properly secured

## 9. API Endpoints

The dashboard uses these API functions (already implemented):
- `getStudentData(userId)` - Get student profile
- `getStudentEarnings(userId)` - Calculate earnings by time period
- `getStudentPurchases(userId)` - Get purchase history
- `getStudentWithdrawals(userId)` - Get withdrawal history
- `getStudentAffiliateData(userId)` - Get affiliate stats
- `requestWithdrawal(userId, amount)` - Create withdrawal request

## 10. Testing the Dashboard

1. Register a new user through your existing registration flow
2. The user will be automatically created in the students table
3. Login and navigate to `/dashboard` to see the student dashboard
4. All data will be fetched from Supabase

## 11. Sample Data

The schema includes sample packages. You can add more test data by:

```sql
-- Add a test student (replace with actual Firebase UID)
INSERT INTO students (firebase_uid, name, email, referral_code) 
VALUES ('test-uid', 'Test User', 'youthpargatii@gmail.com', 'TEST123');

-- Add test purchases
INSERT INTO purchases (student_id, package_name, amount, commission_earned)
SELECT id, 'Pargati Starter', 376.00, 37.60 FROM students WHERE firebase_uid = 'test-uid';
```

## 12. Production Considerations

1. **Security**: Review and adjust RLS policies as needed
2. **Performance**: Monitor query performance and add indexes if needed
3. **Backup**: Set up regular database backups
4. **Monitoring**: Use Supabase dashboard to monitor usage and performance
5. **Scaling**: Consider connection pooling for high traffic

## 13. Customization

You can customize the dashboard by:
- Modifying the UI components in `StudentDashboard.jsx`
- Adding new API functions in `api.js`
- Creating new database tables and updating the schema
- Adding new features like notifications, analytics, etc.

## 14. Troubleshooting

Common issues:
- **RLS errors**: Check that policies are correctly set up
- **Connection issues**: Verify Supabase URL and keys
- **Data not loading**: Check browser console for errors
- **Permission errors**: Ensure user is properly authenticated

## 15. Migration for Existing Users

If you have existing users in your database, you may need to run the affiliate record migration to ensure all students have affiliate records:

1. Run the `migrate-affiliate-records.sql` script in your Supabase SQL Editor
2. This will create affiliate records for any students that don't already have them

For more help, check the [Supabase documentation](https://supabase.com/docs).
