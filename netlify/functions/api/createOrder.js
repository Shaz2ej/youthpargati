// Netlify Function to proxy requests to Pay0.Shop API
// This fixes CORS issues by moving the API call to the server-side
// The function acts as a proxy between the frontend and Pay0.Shop API

exports.handler = async (event, context) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow requests from any origin
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ message: 'CORS preflight response' }),
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    console.log('Received request:', requestBody);

    // Get the API key from environment variables
    const apiKey = process.env.PAY0_SHOP_API_KEY;
    if (!apiKey) {
      console.error('PAY0_SHOP_API_KEY environment variable not set');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'API key not configured' }),
      };
    }

    // Prepare form data for Pay0.Shop API
    const formData = new URLSearchParams();
    formData.append('customer_mobile', requestBody.customer_mobile || '');
    formData.append('customer_name', requestBody.customer_name || '');
    formData.append('user_token', apiKey);
    formData.append('amount', requestBody.amount);
    formData.append('order_id', requestBody.order_id);
    formData.append('redirect_url', requestBody.redirect_url);
    formData.append('remark1', requestBody.remark1 || 'BuyNow');
    formData.append('remark2', requestBody.remark2 || 'CoursePackage');

    console.log('Sending request to Pay0.Shop API with data:', Object.fromEntries(formData));

    // Call Pay0.Shop API
    const response = await fetch('https://pay0.shop/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    // Get response from Pay0.Shop
    const result = await response.json();
    console.log('Pay0.Shop API response:', result);

    // Return the response to the frontend with proper CORS headers
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*', // This fixes the CORS issue
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to process payment',
        message: error.message 
      }),
    };
  }
};