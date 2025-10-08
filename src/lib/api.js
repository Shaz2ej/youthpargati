import { supabaseClient } from './supabase.js'

// API functions for student dashboard data

// Helper to get internal student ID from Firebase UID to avoid repetition.
const getStudentIdByFirebaseUid = async (firebaseUid) => {
  if (!firebaseUid) {
    // This case should ideally not be hit if called from the dashboard, but it's good practice.
    return { id: null, error: new Error("Firebase UID is required.") };
  }
    const { data, error } = await supabaseClient
      .from('students')
      .select('id')
      .eq('firebase_uid', firebaseUid)
      .single();

  if (error) {
    // Return null id if student not found, but don't treat it as a throw-worthy error here.
    // The calling function can decide how to handle a non-existent student.
    if (error.code === 'PGRST116' || error.message.includes('No rows')) return { id: null, error: null };
    return { id: null, error }; // Return other DB errors.
  }
  return { id: data.id, error: null };
};

export const getStudentData = async (userId) => {
  try {
    const { data, error } = await supabaseClient
      .from('students')
      .select('*')
      .eq('firebase_uid', userId)
      .single()
    
    if (error) {
      console.error('Error fetching student data:', error)
      // Check if it's a "no rows" error (student doesn't exist)
      if (error.code === 'PGRST116' || error.message.includes('No rows')) {
        return { data: null, error: 'No student record found' }
      }
      throw error
    }
    return { data, error: null }
  } catch (error) {
    console.error('getStudentData error:', error)
    return { data: null, error: error.message }
  }
}

export const updateStudentUpiId = async (userId, upiId) => {
  try {
    const { id: studentId, error: studentIdError } = await getStudentIdByFirebaseUid(userId);
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
    const { id: studentId, error: studentIdError } = await getStudentIdByFirebaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) {
      return { data: { day1: 0, day10: 0, day20: 0, day30: 0, total: 0 }, error: null };
    }

    // Get purchases for commission calculation
    const { data: purchases, error: purchasesError } = await supabaseClient
      .from('purchases')
      .select('commission_earned, purchase_date')
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
      .reduce((sum, p) => sum + (p.commission_earned || 0), 0)

    const day10Earnings = purchases
      .filter(p => new Date(p.purchase_date) >= day10)
      .reduce((sum, p) => sum + (p.commission_earned || 0), 0)

    const day20Earnings = purchases
      .filter(p => new Date(p.purchase_date) >= day20)
      .reduce((sum, p) => sum + (p.commission_earned || 0), 0)

    const day30Earnings = purchases
      .filter(p => new Date(p.purchase_date) >= day30)
      .reduce((sum, p) => sum + (p.commission_earned || 0), 0)

    const totalEarnings = purchases
      .reduce((sum, p) => sum + (p.commission_earned || 0), 0)

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
    const { id: studentId, error: studentIdError } = await getStudentIdByFirebaseUid(userId);
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
    const { id: studentId, error: studentIdError } = await getStudentIdByFirebaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) {
      return { data: [], error: null };
    }

    const { data, error } = await supabaseClient
      .from('withdrawals')
      .select('*')
      .eq('student_id', studentId)
      .order('request_date', { ascending: false })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('getStudentWithdrawals error:', error)
    return { data: null, error: error.message }
  }
}

export const getStudentAffiliateData = async (userId) => {
  try {
    const { id: studentId, error: studentIdError } = await getStudentIdByFirebaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) {
      return { data: { referral_code: 'N/A', total_leads: 0, total_commission: 0 }, error: null };
    }

    const { data, error } = await supabaseClient
      .from('affiliates')
      .select('*')
      .eq('student_id', studentId)
      .single()
    
    if (error) {
      // It's not a critical error if a student doesn't have an affiliate record yet.
      // This can happen if the record creation failed or for new users.
      if (error.code === 'PGRST116') { // "No rows found" error code
        return { data: { referral_code: 'N/A', total_leads: 0, total_commission: 0 }, error: null };
      }
      throw error;
    }
    return { data, error: null }
  } catch (error) {
    console.error('getStudentAffiliateData error:', error)
    return { data: null, error: error.message }
  }
}

export const requestWithdrawal = async (userId, amount, upiId = null) => {
  try {
    const { id: studentId, error: studentIdError } = await getStudentIdByFirebaseUid(userId);
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
      request_date: new Date().toISOString(),
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
    const { id: studentId, error: studentIdError } = await getStudentIdByFirebaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) {
      return { data: 0, error: null };
    }

    // Fetch total commission and total completed withdrawals in parallel for efficiency
    const [purchasesRes, withdrawalsRes] = await Promise.all([
      supabaseClient
        .from('purchases')
        .select('commission_earned')
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

    const totalEarnings = purchasesRes.data.reduce((sum, p) => sum + (p.commission_earned || 0), 0);
    const totalWithdrawn = withdrawalsRes.data.reduce((sum, w) => sum + w.amount, 0);

    return { data: totalEarnings - totalWithdrawn, error: null };
  } catch (error) {
    console.error('getAvailableBalance error:', error)
    return { data: 0, error: `Failed to get balance: ${error.message}` }
  }
}

/**
 * Create a new student record
 * @param {string} firebaseUid - Firebase user ID
 * @param {string} name - Student name
 * @param {string} email - Student email
 * @param {string} phone - Student phone number
 * @param {string} referralCode - Optional referral code from URL
 */
export const createStudent = async (firebaseUid, name, email, phone, referralCode = null) => {
  try {
    // Generate a unique referral code
    const studentReferralCode = generateReferralCode(name)
    
    const { data, error } = await supabaseClient
      .from('students')
      .insert({
        firebase_uid: firebaseUid,
        name: name,
        email: email,
        phone: phone,
        referral_code: studentReferralCode
      })
      .select()
      .single()

    if (error) throw error

    // Create affiliate record
    const { error: affiliateError } = await supabaseClient
      .from('affiliates')
      .insert({
        student_id: data.id,
        referral_code: studentReferralCode,
        total_leads: 0,
        total_commission: 0
      })
    
    if (affiliateError) {
      console.error('Error creating affiliate record:', affiliateError)
      // Don't throw error here as student was created successfully
    }
    
    // If there's a referral code, find the referrer and create referral record
    if (referralCode) {
      const { data: referrerData, error: referrerError } = await supabaseClient
        .from('user_referral_codes')
        .select('user_id')
        .eq('referral_code', referralCode)
        .single()
      
      if (!referrerError && referrerData) {
        // Create referral record
        await supabaseClient
          .from('referrals')
          .insert({
            referrer_id: referrerData.user_id,
            referred_id: data.id,
            referral_code: referralCode
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

// Helper function to generate referral code
const generateReferralCode = (name) => {
  const cleanName = name.replace(/\s+/g, '').toUpperCase()
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return cleanName.substring(0, 3) + randomNum
}

/**
 * Get user's package-specific referral codes
 * @param {string} userId - Firebase user ID
 */
export const getUserReferralCodes = async (userId) => {
  try {
    const { id: studentId, error: studentIdError } = await getStudentIdByFirebaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) {
      return { data: [], error: null };
    }

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
      .eq('user_id', studentId)
      .in('package_id', packageIds)
    
    if (referralError) throw referralError;
    
    return { data: referralCodes, error: null };
  } catch (error) {
    console.error('getUserReferralCodes error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Generate referral codes for all packages a user has purchased
 * @param {string} userId - Firebase user ID
 */
export const generateUserReferralCodes = async (userId) => {
  try {
    const { id: studentId, error: studentIdError } = await getStudentIdByFirebaseUid(userId);
    if (studentIdError) throw studentIdError;
    if (!studentId) {
      throw new Error("Student not found");
    }
    
    // Get student name
    const { data: studentData, error: studentError } = await supabaseClient
      .from('students')
      .select('name')
      .eq('id', studentId)
      .single()
    
    if (studentError) throw studentError;
    
    // Get packages this user has purchased
    const { data: purchases, error: purchasesError } = await supabaseClient
      .from('purchases')
      .select('package_id, packages (id, title)')
      .eq('student_id', studentId)
    
    if (purchasesError) throw purchasesError;
    
    // Generate referral codes for each purchased package
    const referralCodes = [];
    for (const purchase of purchases) {
      const packageName = purchase.packages?.title || 'Unknown';
      
      // Generate unique referral code
      const referralCode = generatePackageReferralCode(studentData.name, packageName);
      const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
      
      // Insert referral code
      const { data: insertedCode, error: insertError } = await supabaseClient
        .from('user_referral_codes')
        .insert({
          user_id: studentId,
          package_id: purchase.package_id,
          referral_code: referralCode,
          referral_link: referralLink
        })
        .select()
        .single()
      
      if (!insertError && insertedCode) {
        referralCodes.push({
          ...insertedCode,
          package: purchase.packages
        });
      }
    }
    
    return { data: referralCodes, error: null };
  } catch (error) {
    console.error('generateUserReferralCodes error:', error);
    return { data: null, error: error.message };
  }
}

// Get courses by package ID (matches admin panel logic)
export const getCoursesByPackageId = async (packageId) => {
  try {
    const { data, error } = await supabaseClient
      .from('package_courses')
      .select(`
        courses (
          id,
          title,
          description,
          created_at
        )
      `)
      .eq('Package_id', packageId);
    
    if (error) {
      console.error("Error fetching courses:", error.message);
      throw error;
    }
    
    console.log("Courses for this package:", data);
    
    // Transform the nested data structure
    const transformedData = data?.map(item => ({
      id: item.courses.id,
      title: item.courses.title,
      description: item.courses.description,
      created_at: item.courses.created_at
    })) || [];
    
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('getCoursesByPackageId error:', error);
    return { data: null, error: error.message };
  }
}
