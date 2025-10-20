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

// Use environment variables for API key and redirect URL
const PAY0_SHOP_API_KEY = import.meta.env.VITE_PAY0_SHOP_API_KEY || 'e694ab0346cf984568f7e52caebbd07e';
const REDIRECT_URL = import.meta.env.VITE_PAYMENT_SUCCESS_URL || "https://youthpargati.netlify.app/payment-success";

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
    
    // For local development, we'll make a direct call to Pay0.shop
    // In production, we should use the Netlify function to avoid CORS issues
    const isLocal = window.location.hostname === 'localhost';
    let result;
    let response; // Declare response variable
    
    if (isLocal) {
      // Direct API call for local development
      console.log('Making direct API call to Pay0.shop for local development');
      
      const formData = new URLSearchParams();
      formData.append('customer_mobile', orderData.customer_mobile || '');
      formData.append('customer_name', orderData.customer_name || '');
      formData.append('user_token', PAY0_SHOP_API_KEY);
      formData.append('amount', orderData.amount);
      formData.append('order_id', orderId);
      formData.append('redirect_url', REDIRECT_URL);
      formData.append('remark1', 'BuyNow');
      formData.append('remark2', 'CoursePackage');
      
      response = await fetch('https://pay0.shop/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        console.error('Pay0.shop API error:', response.status, response.statusText);
        throw new Error(`Pay0.shop API error: ${response.status} ${response.statusText}`);
      }
      
      result = await response.json();
      console.log('Pay0.shop API response:', result);
    } else {
      // Use Netlify function in production
      response = await fetch('/.netlify/functions/create-order', {
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
      
      // Check if response is OK before trying to parse JSON
      console.log('Netlify function response status:', response.status);
      console.log('Netlify function response headers:', response.headers);
      
      if (!response.ok) {
        console.error('Netlify function error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Netlify function error details:', errorText);
        throw new Error(`Netlify function error: ${response.status} ${response.statusText}. Details: ${errorText}`);
      }
      
      result = await response.json();
      console.log('Netlify Function response:', result);
    }
    
    console.log('Response status:', response.status);
    console.log('Full response from Netlify function:', result);
    
    // Check if we have a payment URL to redirect to
    // Based on the response structure: {"status":true,"message":"Order Created Successfully","result":{"orderId":"ORDER1760011833257","payment_url":"https://pay0.shop/instant/..."}}
    if (result?.status && result?.result?.payment_url) {
      console.log("Redirecting to:", result.result.payment_url);
      
      // Note: We're removing the purchase record insertion from here
      // Purchase record will be created in PaymentSuccess.jsx after successful payment
      // This avoids RLS issues and ensures we only record successful payments
      
      // Immediately redirect the user to the payment page
      window.location.replace(result.result.payment_url);
      // Note: We don't return anything here because the redirect will navigate away from the page
    } else {
      console.warn('Payment URL not found in response', result);
      console.warn('Result status:', result?.status);
      console.warn('Result result:', result?.result);
      console.warn('Result payment_url:', result?.result?.payment_url);
      
      // Check if there's an error message in the response
      let errorMessage = 'Failed to get payment URL. Please try again.';
      if (result?.message) {
        errorMessage = result.message;
      } else if (result?.error) {
        errorMessage = result.error;
      }
      
      // If no payment URL, return an error
      return {
        status: false,
        message: errorMessage
      };
    }
  } catch (error) {
    console.error('Payment error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Failed to process payment. Please try again.';
    if (error.message.includes('404')) {
      errorMessage = 'Payment service is currently unavailable. Please try again later.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    
    return {
      status: false,
      message: errorMessage
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

/**
 * Handle purchase insertion and QR screen opening
 * @param {Object} currentUser - The current user object
 * @param {Object} purchasedPackage - The package being purchased
 * @param {string} referralCode - Optional referral code
 */
export const handlePurchaseAndQR = async (currentUser, purchasedPackage, referralCode = null) => {
  try {
    const { data, error } = await supabase.from('purchases').insert([{
      student_id: currentUser.id,
      package_id: purchasedPackage.id,
      amount: purchasedPackage.price,
      commission: 0,
      referral_code: referralCode || null,
      status: 'completed'
    }]);

    if (error) {
      console.error('Error inserting purchase record:', error);
      alert('Failed to record purchase. Please try again.');
      return; // QR code open nahi hoga
    }

    console.log('Purchase inserted successfully:', data);
    openQRCodeScreen(); // QR code sirf successful insert ke baad
  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Something went wrong. Please try again.');
  }
}

/**
 * Open QR code screen for payment
 */
const openQRCodeScreen = () => {
  // Create a simple modal with a placeholder for the QR code
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      max-width: 90%;
      width: 400px;
    ">
      <h3 style="margin-top: 0; color: #333;">Scan QR Code to Pay</h3>
      <div id="qr-code-placeholder" style="
        width: 256px;
        height: 256px;
        background: #f0f0f0;
        margin: 20px auto;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed #ccc;
      ">
        <p style="color: #666; font-size: 14px;">
          QR Code would appear here<br>
          (Integration with payment provider needed)
        </p>
      </div>
      <p style="color: #666; margin-bottom: 20px;">
        Scan this QR code with your UPI app to complete the payment
      </p>
      <button id="close-qr-modal" style="
        background: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
      ">
        Close
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listener to close button
  modal.querySelector('#close-qr-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Close modal when clicking outside the content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
};
