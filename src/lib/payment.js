import { supabase } from '@/lib/supabase.js'

/**
 * PAYMENT INTEGRATION INSTRUCTIONS:
 * 
 * 1. Replace 'e694ab0346cf984568f7e52caebbd07e' with your actual Pay0.Shop API key
 * 2. For production, store these values in environment variables
 * 
 * Example for environment variables:
 * const PAY0_SHOP_API_KEY = import.meta.env.VITE_PAY0_SHOP_API_KEY
 * const REDIRECT_URL = import.meta.env.VITE_PAYMENT_SUCCESS_URL
 */

// Your actual Pay0.Shop API key
const PAY0_SHOP_API_KEY = 'e694ab0346cf984568f7e52caebbd07e'
const REDIRECT_URL = 'http://localhost:5176/payment-success'

/**
 * Create a hidden form and submit it to Pay0.Shop
 * This approach avoids CORS issues by letting the browser handle the POST
 * @param {Object} orderData - The order data
 * @param {string} referralCode - Optional referral code
 */
export const createPay0ShopOrder = async (orderData, referralCode = null) => {
  try {
    // Generate order ID
    const orderId = `ORDER${Date.now()}`
    
    // Try fetch-based approach first to get JSON response through Netlify Function
    console.log('Creating order with Netlify Function proxy');
    
    const response = await fetch('/.netlify/functions/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_mobile: orderData.customer_mobile || '',
        customer_name: orderData.customer_name || '',
        amount: orderData.amount,
        order_id: orderId,
        redirect_url: REDIRECT_URL,
        remark1: 'BuyNow',
        remark2: 'CoursePackage'
      })
    });
    
    const result = await response.json();
    console.log('Netlify Function response:', result);
    
    // Check if we have a payment URL to redirect to
    if (result.status && result.result && result.result.payment_url) {
      console.log('Redirecting to payment URL:', result.result.payment_url);
      
      // Save order information to purchases table before redirecting
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('firebase_uid', orderData.user_id)
        .single()
      
      if (!studentError && studentData) {
        // Insert purchase record (referral code will be processed by database trigger)
        const purchaseData = {
          student_id: studentData.id,
          package_id: orderData.package_id,
          package_name: orderData.package_name,
          amount: orderData.amount,
          commission_earned: 0, // Will be calculated by database trigger
          status: 'pending',
          payment_method: 'Pay0.Shop',
          transaction_id: orderId
        }
        
        // If a referral code is provided, store it with the purchase
        if (referralCode) {
          purchaseData.referral_code = referralCode;
        }
        
        const { error: purchaseError } = await supabase
          .from('purchases')
          .insert(purchaseData)
      }
      
      // Redirect to payment URL
      window.location.href = result.result.payment_url;
      return { status: true };
    } else {
      // If no payment URL, fall back to form submission
      console.log('No payment URL in response, falling back to form submission');
      
      // Create a hidden form
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = 'https://pay0.shop/api/create-order'
      form.style.display = 'none'
      
      // Add form fields
      const fields = {
        customer_mobile: orderData.customer_mobile || '',
        customer_name: orderData.customer_name || '',
        user_token: PAY0_SHOP_API_KEY,
        amount: orderData.amount,
        order_id: orderId,
        redirect_url: REDIRECT_URL,
        remark1: 'BuyNow',
        remark2: 'CoursePackage'
      }
      
      // Add each field to the form
      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value
        form.appendChild(input)
      }
      
      // Add form to document and submit
      document.body.appendChild(form)
      form.submit()
      
      // Save order information to purchases table
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('firebase_uid', orderData.user_id)
        .single()
      
      if (!studentError && studentData) {
        // Insert purchase record (referral code will be processed by database trigger)
        const purchaseData = {
          student_id: studentData.id,
          package_id: orderData.package_id,
          package_name: orderData.package_name,
          amount: orderData.amount,
          commission_earned: 0, // Will be calculated by database trigger
          status: 'pending',
          payment_method: 'Pay0.Shop',
          transaction_id: orderId
        }
        
        // If a referral code is provided, store it with the purchase
        if (referralCode) {
          purchaseData.referral_code = referralCode;
        }
        
        const { error: purchaseError } = await supabase
          .from('purchases')
          .insert(purchaseData)
      }
      
      return { status: true }
    }
  } catch (error) {
    console.error('Payment error:', error)
    return {
      status: false,
      message: 'Failed to process payment. Please try again.'
    }
  }
}

/**
 * Handle payment for a package
 * @param {Object} packageData - The package data
 * @param {Object} userData - The user data
 * @param {string} referralCode - Optional referral code
 */
export const handlePackagePayment = async (packageData, userData, referralCode = null) => {
  // In a real application, you would collect customer details
  // For now, we'll use placeholder values
  const orderData = {
    customer_mobile: userData.phone || '',
    customer_name: userData.name || 'Customer',
    amount: packageData.price,
    package_name: packageData.title,
    package_id: packageData.id,
    user_id: userData.uid
  }
  
  const result = await createPay0ShopOrder(orderData, referralCode)
  
  // Note: With form submission, we don't get a response back to handle
  // The browser will redirect to Pay0.Shop automatically
  if (!result.status) {
    // Show error message only if we failed to initiate the process
    alert(result.message || 'Failed to initiate payment. Please try again.')
  }
  
  return result
}

/**
 * Generate a unique referral code for a user and package
 * @param {string} username - The user's name
 * @param {string} packageName - The package name
 * @returns {string} - The generated referral code
 */
export const generatePackageReferralCode = (username, packageName) => {
  // Take first 3 letters of username and package name
  const userPart = username.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const packagePart = packageName.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  
  // Add random numbers
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${userPart}${packagePart}${randomNum}`;
}