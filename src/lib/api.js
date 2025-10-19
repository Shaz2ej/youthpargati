import { supabaseClient, supabase } from './supabase.js'

// Log the supabaseClient to see what we're using
console.log('API: Imported supabaseClient', supabaseClient);
console.log('API: Imported supabase', supabase);

// API functions for student dashboard data

// Helper to get internal student ID from Supabase UID to avoid repetition.
const getStudentIdBySupabaseUid = async (supabaseUid) => {
  console.log('getStudentIdBySupabaseUid: Called with supabaseUid', supabaseUid);
  
  if (!supabaseUid) {
    // This case should ideally not be hit if called from the dashboard, but it's good practice.
    console.log('getStudentIdBySupabaseUid: No supabaseUid provided');
    return { id: null, error: new Error("Supabase UID is required.") };
  }
  
  console.log('getStudentIdBySupabaseUid: Making request to students table');
  const { data, error } = await supabaseClient
    .from('students')
    .select('id')  // We want the database-generated ID
    .eq('supabase_auth_uid', supabaseUid)  // But we query by supabase_auth_uid
    .single();

  console.log('getStudentIdBySupabaseUid: Request result', data, error);

  if (error) {
    // Return null id if student not found, but don't treat it as a throw-worthy error here.
    // The calling function can decide how to handle a non-existent student.
    if (error.code === 'PGRST116' || error.message.includes('No rows')) {
      console.log('getStudentIdBySupabaseUid: No student found with this supabase_auth_uid');
      return { id: null, error: null };
    }
    console.log('getStudentIdBySupabaseUid: Other error occurred', error);
    return { id: null, error }; // Return other DB errors.
  }
  
  console.log('getStudentIdBySupabaseUid: Success, returning student ID', data.id);
  return { id: data.id, error: null };  // Return the database-generated ID
};

// Function to get courses by package ID
export const getCoursesByPackageId = async (packageId) => {
  try {
    const { data, error } = await supabaseClient
      .from('courses')
      .select('*')
      .eq('package_id', packageId)
    
    if (error) {
      console.error('Error fetching courses by package ID:', error)
      return { data: null, error: error.message }
    }
    return { data, error: null }
  } catch (error) {
    console.error('getCoursesByPackageId error:', error)
    return { data: null, error: error.message }
  }
};

export const getStudentData = async (userId) => {
  try {
    console.log('getStudentData: Called with userId', userId);
    
    // Test if we can get the current user
    try {
      const { data: currentUser, error: userError } = await supabaseClient.auth.getUser();
      console.log('getStudentData: Current user', currentUser, userError);
    } catch (userCheckError) {
      console.error('getStudentData: Error checking current user', userCheckError);
    }
    
    const { data, error } = await supabaseClient
      .from('students')
      .select('*')
      .eq('supabase_auth_uid', userId)  // Query by supabase_auth_uid
      .single()
    
    console.log('getStudentData: Result', data, error);
    
    if (error) {
      console.error('Error fetching student data:', error)
      // Check if it's a "no rows" error (student doesn't exist)
      if (error.code === 'PGRST116' || error.message.includes('No rows')) {
        console.log('getStudentData: No student record found');
        return { data: null, error: 'No student record found' }
      }
      throw error
    }
    console.log('getStudentData: Student data found', data);
    return { data, error: null }
  } catch (error) {
    console.error('getStudentData error:', error)
    return { data: null, error: error.message }
  }
}

export const updateStudentUpiId = async (userId, upiId) => {
  try {
    const { id: studentId, error: studentIdError } = await getStudentIdBySupabaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) throw new Error("Student not found");

    const { data, error } = await supabaseClient
      .from('students')
      .update({ upi_id: upiId })
      .eq('id', studentId)
      .select()
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('updateStudentUpiId error:', error)
    return { data: null, error: error.message }
  }
}

export const getStudentEarnings = async (userId) => {
  try {
    const { id: studentId, error: studentIdError } = await getStudentIdBySupabaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) {
      return { data: { day1: 0, day10: 0, day20: 0, day30: 0, total: 0 }, error: null };
    }

    // Get purchases for commission calculation
    const { data: purchases, error: purchasesError } = await supabaseClient
      .from('purchases')
      .select('commission, purchase_date')
      .eq('student_id', studentId)
      .eq('status', 'completed')
    
    if (purchasesError) throw purchasesError

    // Calculate earnings by time periods
    const now = new Date()
    const day1 = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const day10 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
    const day20 = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const day1Earnings = purchases
      .filter(p => new Date(p.purchase_date) >= day1)
      .reduce((sum, p) => sum + (p.commission || 0), 0)

    const day10Earnings = purchases
      .filter(p => new Date(p.purchase_date) >= day10)
      .reduce((sum, p) => sum + (p.commission || 0), 0)

    const day20Earnings = purchases
      .filter(p => new Date(p.purchase_date) >= day20)
      .reduce((sum, p) => sum + (p.commission || 0), 0)

    const day30Earnings = purchases
      .filter(p => new Date(p.purchase_date) >= day30)
      .reduce((sum, p) => sum + (p.commission || 0), 0)

    const totalEarnings = purchases
      .reduce((sum, p) => sum + (p.commission || 0), 0)

    return {
      data: {
        day1: day1Earnings,
        day10: day10Earnings,
        day20: day20Earnings,
        day30: day30Earnings,
        total: totalEarnings
      },
      error: null
    }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export const getStudentPurchases = async (userId) => {
  try {
    const { id: studentId, error: studentIdError } = await getStudentIdBySupabaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) {
      return { data: [], error: null };
    }

    const { data, error } = await supabaseClient
      .from('purchases')
      .select('*')
      .eq('student_id', studentId)
      .order('purchase_date', { ascending: false })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('getStudentPurchases error:', error)
    return { data: null, error: error.message }
  }
}

export const getStudentWithdrawals = async (userId) => {
  try {
    const { id: studentId, error: studentIdError } = await getStudentIdBySupabaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) {
      return { data: [], error: null };
    }

    const { data, error } = await supabaseClient
      .from('withdrawals')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('getStudentWithdrawals error:', error)
    return { data: null, error: error.message }
  }
}

export const getStudentAffiliateData = async (userId) => {
  try {
    console.log('getStudentAffiliateData: Called with userId', userId);
    
    const { id: studentId, error: studentIdError } = await getStudentIdBySupabaseUid(userId);
    console.log('getStudentAffiliateData: Student ID lookup result', studentId, studentIdError);
    
    if (studentIdError) throw studentIdError;
    if (!studentId) {
      console.log('getStudentAffiliateData: No student ID found');
      return { data: { referral_code: 'N/A', total_leads: 0, total_commission: 0 }, error: null };
    }

    // First, try to get the affiliate data
    console.log('getStudentAffiliateData: Making request for studentId', studentId);
    
    // Log the supabaseClient to see what we're using
    console.log('getStudentAffiliateData: Using supabaseClient', supabaseClient);
    
    // Test if we can get the current user
    try {
      const { data: currentUser, error: userError } = await supabaseClient.auth.getUser();
      console.log('getStudentAffiliateData: Current user', currentUser, userError);
    } catch (userCheckError) {
      console.error('getStudentAffiliateData: Error checking current user', userCheckError);
    }
    
    // Remove .single() to prevent 406 Not Acceptable error
    // This will return an array instead of a single object
    const { data, error } = await supabaseClient
      .from('affiliates')
      .select('*')
      .eq('student_id', studentId);
      // .single() removed to resolve 406 error
    
    console.log('getStudentAffiliateData: Request result', data, error);
    
    if (error) {
      console.error('getStudentAffiliateData: Error from Supabase', error);
      throw error;
    }
    
    // Handle the case where we now get an array instead of a single object
    if (data && data.length > 0) {
      console.log('getStudentAffiliateData: Affiliate record found', data[0]);
      return { data: data[0], error: null };
    } else {
      // No affiliate record found
      console.log('getStudentAffiliateData: No affiliate record found, returning default');
      return { data: { referral_code: 'N/A', total_leads: 0, total_commission: 0 }, error: null };
    }
  } catch (error) {
    console.error('getStudentAffiliateData error:', error);
    return { data: null, error: error.message };
  }
}

export const requestWithdrawal = async (userId, amount, upiId = null) => {
  try {
    const { id: studentId, error: studentIdError } = await getStudentIdBySupabaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) throw new Error("Student not found, cannot request withdrawal.");

    // Validate minimum withdrawal amount
    if (amount < 200) {
      throw new Error("Minimum withdrawal amount is ₹200");
    }

    // Check if there's a pending withdrawal
    const { data: pendingWithdrawals, error: pendingError } = await supabaseClient
      .from('withdrawals')
      .select('id')
      .eq('student_id', studentId)
      .eq('status', 'pending')
    
    if (pendingError) throw pendingError;
    
    if (pendingWithdrawals && pendingWithdrawals.length > 0) {
      throw new Error("You already have a pending withdrawal request. Please wait for it to be processed.");
    }

    // Prepare withdrawal data
    const withdrawalData = {
      student_id: studentId,
      amount: amount,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    // Add UPI ID if provided
    if (upiId) {
      withdrawalData.bank_details = { upi_id: upiId };
    }

    const { data, error } = await supabaseClient
      .from('withdrawals')
      .insert(withdrawalData)
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('requestWithdrawal error:', error)
    return { data: null, error: error.message }
  }
}

export const getAvailableBalance = async (userId) => {
  try {
    const { id: studentId, error: studentIdError } = await getStudentIdBySupabaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) {
      return { data: 0, error: null };
    }

    // Fetch total commission and total completed withdrawals in parallel for efficiency
    const [purchasesRes, withdrawalsRes] = await Promise.all([
      supabaseClient
        .from('purchases')
        .select('commission')
        .eq('student_id', studentId)
        .eq('status', 'completed'),
      supabaseClient
        .from('withdrawals')
        .select('amount')
        .eq('student_id', studentId)
        .eq('status', 'completed')
    ]);

    if (purchasesRes.error) throw purchasesRes.error;
    if (withdrawalsRes.error) throw withdrawalsRes.error;

    const totalEarnings = purchasesRes.data.reduce((sum, p) => sum + (p.commission || 0), 0);
    const totalWithdrawn = withdrawalsRes.data.reduce((sum, w) => sum + w.amount, 0);

    return { data: totalEarnings - totalWithdrawn, error: null };
  } catch (error) {
    console.error('getAvailableBalance error:', error)
    return { data: 0, error: `Failed to get balance: ${error.message}` }
  }
}

/**
 * Create a new student record
 * @param {string} supabaseUid - Supabase user ID
 * @param {string} name - Student name
 * @param {string} email - Student email
 * @param {string} phone - Student phone number
 * @param {string} referralCode - Optional referral code from URL
 */
export const createStudent = async (supabaseUid, name, email, phone, referralCode = null) => {
  try {
    console.log('createStudent: Called with', { supabaseUid, name, email, phone, referralCode });
    
    // Generate a unique referral code
    const studentReferralCode = generateReferralCode(name)
    console.log('createStudent: Generated referral code', studentReferralCode);
    
    // Use upsert instead of insert to prevent duplicate key errors
    const { data, error } = await supabaseClient
      .from('students')
      .upsert({
        supabase_auth_uid: supabaseUid,  // Only set supabase_auth_uid to the Supabase user ID
        name: name,
        email: email,
        phone: phone,
        referral_code: studentReferralCode
      }, {
        onConflict: 'email'  // Conflict on the email field to handle duplicate emails
      })
      .select()
      .single()

    console.log('createStudent: Result', data, error);
    
    if (error) throw error

    // Create affiliate record
    console.log('createStudent: Creating affiliate record for student_id', data.id);
    // Remove total_commission field to resolve the 400 Bad Request error
    const affiliateData = {
      student_id: data.id,  // Use the database-generated ID
      referral_code: studentReferralCode,
      total_leads: 0
      // total_commission field removed to resolve schema cache issue
    };
    console.log('createStudent: Affiliate data to insert', affiliateData);
    
    const { data: affiliateResult, error: affiliateError } = await supabaseClient
      .from('affiliates')
      .upsert(affiliateData, {
        onConflict: 'student_id'  // Conflict on the student_id field
      })
      .select()
      .single();
    
    console.log('createStudent: Affiliate record result', affiliateResult, affiliateError);
    
    if (affiliateError) {
      console.error('Error creating affiliate record:', affiliateError)
      // Don't throw error here as student was created successfully
    }
    
    // If there's a referral code, find the referrer and create referral record
    if (referralCode) {
      console.log('createStudent: Processing referral code', referralCode);
      const { data: referrerData, error: referrerError } = await supabaseClient
        .from('user_referral_codes')
        .select('user_id')
        .eq('referral_code', referralCode)
        .single()
      
      if (!referrerError && referrerData) {
        console.log('createStudent: Found referrer', referrerData);
        // Create referral record
        await supabaseClient
          .from('referrals')
          .upsert({
            referrer_id: referrerData.user_id,
            referred_id: data.id,
            referral_code: referralCode
          }, {
            onConflict: 'referred_id'  // Conflict on the referred_id field
          })
        
        // Update referrer's lead count
        await supabaseClient
          .from('affiliates')
          .update({ total_leads: supabaseClient.rpc('increment', { value: 1 }) })
          .eq('student_id', referrerData.user_id)
      }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('createStudent error:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Ensure student record exists, creating one if it doesn't
 * @param {string} supabaseUid - Supabase user ID
 * @param {Object} userMetadata - User metadata from auth provider
 */
export const ensureStudentRecord = async (supabaseUid, userMetadata = {}) => {
  try {
    console.log('ensureStudentRecord: Called with', { supabaseUid, userMetadata });
    
    // First, try to get existing student data
    const studentResult = await getStudentData(supabaseUid);
    console.log('ensureStudentRecord: Existing student check result', studentResult);
    
    // If student exists, return the data
    if (studentResult.data && !studentResult.error) {
      console.log('ensureStudentRecord: Student record found', studentResult.data);
      return { data: studentResult.data, error: null };
    }
    
    // If student doesn't exist, create one
    if (studentResult.error === 'No student record found') {
      console.log('ensureStudentRecord: Student record not found, creating new one...');
      const createResult = await createStudent(
        supabaseUid,
        userMetadata?.name || 'Student',
        userMetadata?.email || '',
        userMetadata?.phone || ''
      );
      console.log('ensureStudentRecord: Create student result', createResult);
      
      if (createResult.error) {
        console.error('ensureStudentRecord: Failed to create student', createResult.error);
        return { data: null, error: createResult.error };
      }
      
      console.log('ensureStudentRecord: Student record created successfully', createResult.data);
      return { data: createResult.data, error: null };
    }
    
    // If there was another error, return it
    console.error('ensureStudentRecord: Error checking student record', studentResult.error);
    return { data: null, error: studentResult.error };
  } catch (error) {
    console.error('ensureStudentRecord: Unexpected error', error);
    return { data: null, error: error.message };
  }
};

/**
 * Ensure affiliate record exists for a student, creating one if it doesn't
 * @param {string} studentId - Database-generated student ID
 * @param {string} referralCode - Student's referral code
 */
export const ensureAffiliateRecord = async (studentId, referralCode) => {
  try {
    console.log('ensureAffiliateRecord: Called with', { studentId, referralCode });
    
    // First, try to get existing affiliate data
    const { data, error } = await supabaseClient
      .from('affiliates')
      .select('*')
      .eq('student_id', studentId)
      .single();
    
    console.log('ensureAffiliateRecord: Existing affiliate check result', data, error);
    
    // If affiliate record exists, return it
    if (data && !error) {
      console.log('ensureAffiliateRecord: Affiliate record found', data);
      return { data, error: null };
    }
    
    // If no affiliate record exists (PGRST116 error), create one
    if (error && error.code === 'PGRST116') {
      console.log('ensureAffiliateRecord: No affiliate record found, creating new one...');
      
      // Remove total_commission field to resolve the 400 Bad Request error
      const affiliateData = {
        student_id: studentId,
        referral_code: referralCode,
        total_leads: 0
        // total_commission field removed to resolve schema cache issue
      };
      
      const { data: newAffiliateData, error: createError } = await supabaseClient
        .from('affiliates')
        .upsert(affiliateData, {
          onConflict: 'student_id'
        })
        .select()
        .single();
      
      console.log('ensureAffiliateRecord: Created affiliate record', newAffiliateData, createError);
      
      if (createError) {
        console.error('ensureAffiliateRecord: Failed to create affiliate record', createError);
        return { data: null, error: createError.message };
      }
      
      return { data: newAffiliateData, error: null };
    }
    
    // If there was another error, return it
    console.error('ensureAffiliateRecord: Error checking affiliate record', error);
    return { data: null, error: error?.message || 'Unknown error' };
  } catch (error) {
    console.error('ensureAffiliateRecord: Unexpected error', error);
    return { data: null, error: error.message };
  }
};

// Helper function to generate referral code
const generateReferralCode = (name) => {
  const cleanName = name.replace(/\s+/g, '').toUpperCase()
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return cleanName.substring(0, 3) + randomNum
}

/**
 * Get user's package-specific referral codes
 * @param {string} userId - Supabase user ID (supabase_auth_uid)
 */
export const getUserReferralCodes = async (userId) => {
  try {
    // First get the student record by supabase_auth_uid to get the database-generated ID
    const { data: studentData, error: studentError } = await supabaseClient
      .from('students')
      .select('id')
      .eq('supabase_auth_uid', userId)
      .single()
    
    if (studentError) throw studentError;

    const studentId = studentData.id;  // Use the database-generated ID

    // Get packages this user has purchased
    const { data: purchases, error: purchasesError } = await supabaseClient
      .from('purchases')
      .select('package_id')
      .eq('student_id', studentId)
    
    if (purchasesError) throw purchasesError;
    
    // Get referral codes for those packages
    const packageIds = purchases.map(p => p.package_id);
    
    if (packageIds.length === 0) {
      return { data: [], error: null };
    }
    
    const { data: referralCodes, error: referralError } = await supabaseClient
      .from('user_referral_codes')
      .select(`
        referral_code,
        referral_link,
        packages (id, title, commission_rate)
      `)
      .in('package_id', packageIds)
    
    if (referralError) throw referralError;
    
    return { data: referralCodes, error: null };
  } catch (error) {
    console.error('getUserReferralCodes error:', error)
    return { data: null, error: error.message }
  }
}

// Function to generate user referral codes for specific packages
export const generateUserReferralCodes = async (userId, packageId) => {
  try {
    // First get the student record by supabase_auth_uid to get the database-generated ID
    const { data: studentData, error: studentError } = await supabaseClient
      .from('students')
      .select('id, referral_code')
      .eq('supabase_auth_uid', userId)
      .single()
    
    if (studentError) throw studentError;

    const studentId = studentData.id;  // Use the database-generated ID

    // Get package details
    const { data: packageData, error: packageError } = await supabaseClient
      .from('packages')
      .select('title')
      .eq('id', packageId)
      .single()
    
    if (packageError) throw packageError;

    // Generate referral link
    const referralLink = `${window.location.origin}/register?ref=${studentData.referral_code}&package=${packageId}`;

    // Check if referral code already exists for this user and package
    const { data: existingCode, error: existingError } = await supabaseClient
      .from('user_referral_codes')
      .select('id')
      .eq('user_id', studentId)
      .eq('package_id', packageId)
      .single()
    
    // If it exists, return existing data
    if (existingCode && !existingError) {
      const { data: existingData, error: fetchError } = await supabaseClient
        .from('user_referral_codes')
        .select(`
          referral_code,
          referral_link,
          packages (id, title, commission_rate)
        `)
        .eq('user_id', studentId)
        .eq('package_id', packageId)
        .single()
      
      if (fetchError) throw fetchError;
      return { data: existingData, error: null };
    }

    // Create new referral code entry
    const { data, error } = await supabaseClient
      .from('user_referral_codes')
      .upsert({
        user_id: studentId,
        package_id: packageId,
        referral_code: studentData.referral_code,
        referral_link: referralLink
      }, {
        onConflict: 'user_id, package_id'  // Conflict on the combination of user_id and package_id
      })
      .select(`
        referral_code,
        referral_link,
        packages (id, title, commission_rate)
      `)
      .single()
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('generateUserReferralCodes error:', error)
    return { data: null, error: error.message }
  }
}